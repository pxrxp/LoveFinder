import { useContext, useEffect, useState } from "react";
import { 
  View, ScrollView, Image, TouchableOpacity, Text, TextInput, ActivityIndicator, Platform 
} from "react-native";
import { AntDesign, Feather, FontAwesome6, FontAwesome } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";

import { useTheme } from "@/contexts/ThemeContext";
import { AuthContext } from "@/contexts/AuthContext";
import { useImageViewerContext } from "@/contexts/ImageViewerContext";

import LoadingScreen from "@/components/LoadingScreen";
import MediaMenuModal from "@/components/modals/MediaMenuModal";
import SelectInterestsModal from "@/components/modals/SelectInterestsModal";

import { pickMedia, launchCamera } from "@/services/media-picker";
import { uploadFile } from "@/services/upload-media";
import { deletePhoto, getMyPhotos } from "@/services/photos";
import { updateProfile, getMyProfile } from "@/services/users";
import { getMyInterests, getAllApprovedInterests, addInterest, removeInterest } from "@/services/interests";
import { showThemedError } from "@/services/themed-error";

import { Photo } from "@/types/Profile";
import { MediaPreview } from "@/types/MediaPreview";

const MAX_PHOTOS = 6;
type InterestType = { id?: number; interest_id?: number; interest_name?: string; name?: string };

const getIntId = (i: InterestType) => i.id ?? i.interest_id!;
const getIntName = (i: InterestType) => i.interest_name || i.name || "Unknown";

export default function ProfileScreen() {
  const { theme, themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const { loading: authLoading } = useContext(AuthContext)!;
  const { openImageViewer } = useImageViewerContext();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  
  const [nameInput, setNameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [dobInput, setDobInput] = useState<Date>(new Date());
  const [bioExpanded, setBioExpanded] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [uploads, setUploads] = useState<(MediaPreview | null)[]>(Array(MAX_PHOTOS).fill(null));
  const [photos, setPhotos] = useState<(Photo | null)[]>(Array(MAX_PHOTOS).fill(null));
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);
  
  const [userInterests, setUserInterests] = useState<InterestType[]>([]);
  const [editInterests, setEditInterests] = useState<InterestType[]>([]);
  const [allInterests, setAllInterests] = useState<InterestType[]>([]);
  
  const [mediaMenuVisible, setMediaMenuVisible] = useState(false);
  const [interestsModalVisible, setInterestsModalVisible] = useState(false);
  const [currentlyUploadingPhotoIndex, setCurrentlyUploadingPhotoIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, photosRes, myInterestsRes, allInterestsRes] = await Promise.all([
        getMyProfile(),
        getMyPhotos(),
        getMyInterests(),
        getAllApprovedInterests(),
      ]);

      const profileData = await profileRes.json();
      const photosData = (await photosRes.json()) as any[];
      const myInterestsData = await myInterestsRes.json();
      const allInterestsData = await allInterestsRes.json();

      setNameInput(profileData.full_name || "");
      setBioInput(profileData.bio || "");
      if (profileData.birth_date) {
        setDobInput(new Date(profileData.birth_date));
      } else {
        setDobInput(dayjs().subtract(18, "year").toDate());
      }

      const initialPhotos = Array(MAX_PHOTOS).fill(null);
      photosData.slice(0, MAX_PHOTOS).forEach((photo, idx) => {
        initialPhotos[idx] = {
          ...photo,
          id: photo.id ?? photo.photo_id, 
        };
      });
      setPhotos(initialPhotos);
      setUploads(Array(MAX_PHOTOS).fill(null));
      setPendingDeletes([]);

      setUserInterests(myInterestsData || []);
      setEditInterests(myInterestsData || []);
      setAllInterests(allInterestsData || []);
    } catch (e) {
      showThemedError(`Failed to load profile:\n${e}`, themeColors);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoSelect = async (media?: MediaPreview | null) => {
    if (!media) return;
    setUploads((prev) =>
      prev.map((p, i) => (i === currentlyUploadingPhotoIndex ? media : p))
    );
  };

  const removePhoto = (index: number) => {
    if (uploads[index]) {
      setUploads((prev) => prev.map((u, i) => (i === index ? null : u)));
    } else if (photos[index]) {
      const idToDelete = photos[index]!.photo_id;
      if (idToDelete) {
        setPendingDeletes((prev) => [...prev, idToDelete]);
      }
      setPhotos((prev) => prev.map((p, i) => (i === index ? null : p)));
    }
  };

  const toggleEditInterest = (interest: InterestType) => {
    const iId = getIntId(interest);
    const exists = editInterests.find((i) => getIntId(i) === iId);
    if (exists) {
      setEditInterests((prev) => prev.filter((i) => getIntId(i) !== iId));
    } else {
      setEditInterests((prev) => [...prev, interest]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const distinctDeletes = new Set(pendingDeletes);
      for (let i = 0; i < MAX_PHOTOS; i++) {
        if (uploads[i] && photos[i]?.photo_id) {
          distinctDeletes.delete(photos[i]!.photo_id);
        }
      }
      const idsToDelete = Array.from(distinctDeletes).filter(id => !!id);
      await Promise.all(idsToDelete.map((id) => deletePhoto(id)));
      
      for (let i = 0; i < MAX_PHOTOS; i++) {
        if (uploads[i]) {
          const extraFields: Record<string, any> = { is_primary: i === 0 };
          if (photos[i]?.photo_id) {
            extraFields.replace_photo_id = photos[i]!.photo_id;
          }
          await uploadFile(
            { uri: uploads[i]!.uri, type: uploads[i]!.type || "image/jpeg" },
            "photos/upload",
            extraFields
          );
        }
      }

      await updateProfile({
        full_name: nameInput.trim(),
        bio: bioInput.trim(),
        birth_date: dayjs(dobInput).format("YYYY-MM-DD"),
      });

      const initialIds = new Set(userInterests.map(getIntId));
      const finalIds = new Set(editInterests.map(getIntId));

      const toAdd = editInterests.filter((i) => !initialIds.has(getIntId(i)));
      const toRemove = userInterests.filter((i) => !finalIds.has(getIntId(i)));

      await Promise.all(toAdd.map((i) => addInterest(getIntId(i))));
      await Promise.all(toRemove.map((i) => removeInterest(getIntId(i))));

      setEditingMode(false);
      await fetchData();
    } catch (e: any) {
      showThemedError(`Failed to save changes:\n${e.message || e}`, themeColors);
    } finally {
      setIsSaving(false);
    }
  };

  const discardEdits = () => {
    setEditingMode(false);
    fetchData();
  };

  if (authLoading || isLoading) return <LoadingScreen />;

  const avatarUri = uploads[0]?.uri ?? photos[0]?.image_url;
  const age = dayjs().diff(dayjs(dobInput), "year");

  return (
    <>
      <SafeAreaView className="flex-1 bg-bgPrimaryLight dark:bg-bgPrimaryDark">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 26,
            paddingTop: 5,
            paddingBottom: insets.bottom + 40,
          }}
          className="flex-1"
        >
          <View className="flex-row items-center mb-6">
            {editingMode ? (
              <>
                <TouchableOpacity className="p-2 -ml-2" onPress={discardEdits} disabled={isSaving}>
                  <AntDesign name="close" size={24} color={themeColors.textPrimary} />
                </TouchableOpacity>
                <Text className="font-bold text-2xl text-textPrimaryLight dark:text-textPrimaryDark px-4">
                  Edit
                </Text>
                <View className="flex-1" />
                <TouchableOpacity className="p-2 -mr-2" onPress={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color={theme === "dark" ? "lightgreen" : "green"} />
                  ) : (
                    <Feather name="check-circle" size={26} color={theme === "dark" ? "lightgreen" : "green"} />
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="font-bold text-2xl text-textPrimaryLight dark:text-textPrimaryDark">
                  Profile
                </Text>
                <View className="flex-1" />
                <TouchableOpacity className="p-2 -mr-2" onPress={() => setEditingMode(true)}>
                  <FontAwesome6 name="edit" size={22} color={themeColors.textPrimary} />
                </TouchableOpacity>
              </>
            )}
          </View>

          <View className="flex-row items-center mb-8">
            <TouchableOpacity
              onPress={() => {
                if (editingMode) {
                  setCurrentlyUploadingPhotoIndex(0);
                  setMediaMenuVisible(true);
                } else if (avatarUri) {
                  openImageViewer(avatarUri);
                }
              }}
              activeOpacity={0.7}
              className="relative"
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 96, height: 96 }}
                  className="rounded-full bg-black/5 dark:bg-white/5"
                />
              ) : (
                <FontAwesome name="user-circle" size={96} color={themeColors.textPrimary} style={{ opacity: 0.2 }} />
              )}
              {editingMode && (
                <View 
                  className="absolute bottom-0 right-0 p-2 rounded-full border-2" 
                  style={{ backgroundColor: themeColors.bgPrimary, borderColor: themeColors.bgPrimary }}
                >
                  <FontAwesome6 name="camera" size={14} color={themeColors.textPrimary} />
                </View>
              )}
            </TouchableOpacity>

            <View className="ml-5 flex-1 justify-center">
              {editingMode ? (
                <>
                  <TextInput
                    value={nameInput}
                    onChangeText={setNameInput}
                    placeholder="Full Name"
                    placeholderTextColor={themeColors.textPrimary + "60"}
                    className="text-2xl font-bold border-b pb-1 mb-2"
                    style={{ color: themeColors.textPrimary, borderColor: themeColors.textPrimary + "20" }}
                  />
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-row items-center mt-1 gap-3">
                    <FontAwesome name="calendar" size={16} color={themeColors.textPrimary} style={{ opacity: 0.6 }} />
                    <Text className="font-semibold text-base" style={{ color: themeColors.textPrimary, opacity: 0.8 }}>
                      {dayjs(dobInput).format("MMM D, YYYY")} ({age})
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={dobInput}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      themeVariant={theme === 'dark' ? 'dark' : 'light'}
                      textColor={themeColors.textPrimary}
                      accentColor={themeColors.textPrimary}
                      onChange={(_, selectedDate) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (selectedDate) setDobInput(selectedDate);
                      }}
                      maximumDate={dayjs().subtract(18, 'years').toDate()}
                    />
                  )}
                </>
              ) : (
                <Text className="text-3xl font-bold text-textPrimaryLight dark:text-textPrimaryDark">
                  {nameInput}, <Text className="font-regular opacity-60">{age}</Text>
                </Text>
              )}
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-base font-bold uppercase tracking-widest mb-3 opacity-40 text-textPrimaryLight dark:text-textPrimaryDark">
              About Me
            </Text>
            {editingMode ? (
              <TextInput
                value={bioInput}
                onChangeText={setBioInput}
                placeholder="Write a little about yourself..."
                placeholderTextColor={themeColors.textPrimary + "60"}
                multiline
                textAlignVertical="top"
                className="font-light rounded-2xl p-4 text-base min-h-[100px] border border-black/10 dark:border-white/10"
                style={{ color: themeColors.textPrimary, backgroundColor: themeColors.textPrimary + "05" }}
              />
            ) : (
              <View>
                <Text 
                  numberOfLines={bioExpanded ? undefined : 3} 
                  className="font-light text-base leading-6 text-textPrimaryLight dark:text-textPrimaryDark opacity-80"
                >
                  {bioInput.replaceAll("\\n", "\n") || "No bio added yet."}
                </Text>
                {!bioExpanded && bioInput?.length > 100 && (
                  <TouchableOpacity onPress={() => setBioExpanded(true)}>
                    <Text className="mt-3 font-semibold opacity-50 text-textPrimaryLight dark:text-textPrimaryDark">
                      Read more...
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <View className="mb-8">
            <Text className="text-base font-bold uppercase tracking-widest mb-3 opacity-40 text-textPrimaryLight dark:text-textPrimaryDark">
              Interests
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {(editingMode ? editInterests : userInterests).map((interest, idx) => (
                <View 
                  key={`interest-pill-${getIntId(interest) ?? idx}`} 
                  className="px-5 py-3 rounded-full flex-row items-center gap-3"
                  style={{ backgroundColor: themeColors.textPrimary + "15" }}
                >
                  <Text className="font-light text-sm" style={{ color: themeColors.textPrimary }}>
                    {getIntName(interest)}
                  </Text>
                  {editingMode && (
                    <TouchableOpacity onPress={() => toggleEditInterest(interest)}>
                      <AntDesign name="close" size={16} color={themeColors.textPrimary} style={{ opacity: 0.7 }} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {editingMode && (
                <TouchableOpacity
                  onPress={() => setInterestsModalVisible(true)}
                  className="px-5 py-3 rounded-full flex-row items-center border border-dashed gap-3"
                  style={{ borderColor: themeColors.textPrimary + "40", backgroundColor: "transparent" }}
                >
                  <AntDesign name="plus" size={14} color={themeColors.textPrimary} style={{ opacity: 0.6 }} />
                  <Text className="font-semibold text-sm" style={{ color: themeColors.textPrimary, opacity: 0.6 }}>
                    Add
                  </Text>
                </TouchableOpacity>
              )}
              
              {!editingMode && userInterests.length === 0 && (
                <Text className="font-light opacity-40 text-textPrimaryLight dark:text-textPrimaryDark">
                  No interests added yet.
                </Text>
              )}
            </View>
          </View>

          <View>
            <Text className="text-base font-bold uppercase tracking-widest mb-3 opacity-40 text-textPrimaryLight dark:text-textPrimaryDark">
              Photos
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
                const photoUri = uploads[index]?.uri ?? photos[index]?.image_url;
                const isEmpty = !photoUri;

                return (
                  <View 
                    key={`photo-grid-${index}`} 
                    style={{ width: '48%', aspectRatio: 0.75, marginBottom: 16 }} 
                    className="relative z-0"
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        if (editingMode && isEmpty) {
                          setCurrentlyUploadingPhotoIndex(index);
                          setMediaMenuVisible(true);
                        } else if (!editingMode && !isEmpty) {
                          openImageViewer(photoUri);
                        }
                      }}
                      className="rounded-2xl overflow-hidden items-center justify-center border-2"
                      style={{
                        flex: 1, 
                        borderColor: isEmpty && editingMode ? themeColors.textPrimary + "20" : "transparent",
                        borderStyle: isEmpty && editingMode ? "dashed" : "solid",
                        backgroundColor: isEmpty ? "transparent" : themeColors.textPrimary + "05"
                      }}
                    >
                      {!isEmpty ? (
                        <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      ) : (
                        editingMode && (
                          <AntDesign name="plus" size={32} color={themeColors.textPrimary} style={{ opacity: 0.3 }} />
                        )
                      )}
                    </TouchableOpacity>

                    {editingMode && !isEmpty && (
                      <TouchableOpacity
                        onPress={() => removePhoto(index)}
                        className="absolute -top-3 -right-3 rounded-full w-8 h-8 items-center justify-center shadow-md z-10 bg-red-500 border-2 border-white dark:border-black"
                      >
                        <AntDesign name="close" size={14} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>

      <MediaMenuModal
        visible={mediaMenuVisible}
        onDismiss={() => setMediaMenuVisible(false)}
        launchCamera={async () => {
          setMediaMenuVisible(false);
          handlePhotoSelect(await launchCamera({ videosAllowed: false }));
        }}
        pickPhoto={async () => {
          setMediaMenuVisible(false);
          handlePhotoSelect(await pickMedia({ videosAllowed: false }));
        }}
        hideAudioRecorderAction
      />

      <SelectInterestsModal
        visible={interestsModalVisible}
        onDismiss={() => setInterestsModalVisible(false)}
        allInterests={allInterests}
        selectedInterests={editInterests}
        toggleInterest={toggleEditInterest}
      />
    </>
  );
}
