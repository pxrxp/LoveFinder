import { useContext, useEffect, useState } from "react";
import { View, ScrollView, Image, TouchableOpacity, Text } from "react-native";
import { AntDesign, Feather, FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { pickMedia, launchCamera } from "@/services/media-picker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AuthContext } from "@/contexts/AuthContext";
import { Photo } from "@/types/Profile";
import LoadingScreen from "@/components/LoadingScreen";
import { MediaPreview } from "@/types/MediaPreview";
import { showThemedError } from "@/services/themed-error";
import { uploadFile } from "@/services/upload-media";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useImageViewerContext } from "@/contexts/ImageViewerContext";
import MediaMenuModal from "@/components/modals/MediaMenuModal";
import { getMyPhotos } from "@/services/photos";

const MAX_PHOTOS = 6;

export default function ProfileScreen() {
  const { theme, toggleTheme, themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  const { login, loading, user, logout } = useContext(AuthContext)!;
  const { openImageViewer } = useImageViewerContext();

  const [editingMode, setEditingMode] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  const [nameInput, setNameInput] = useState(user?.full_name);
  const [bioInput, setBioInput] = useState(user?.bio);
  const [uploads, setUploads] = useState<(MediaPreview | null)[]>(
    Array.from({ length: MAX_PHOTOS }, () => null),
  );
  const [photos, setPhotos] = useState<(Photo | null)[]>([]);

  useEffect(() => {
    try {
      (async () => {
        const fetchedPhotos = await getMyPhotos();
        setPhotos(fetchedPhotos.json() as any as Photo[]);
      })();
    } catch (e) {
      showThemedError(`Failed to fetch photos:\n${e}`, themeColors);
    }
  }, []);

  const handlePhotosUpload = async () => {
    uploads.forEach(async (media, index) => {
      if (!media) return;
      try {
        const res = await uploadFile(
          { uri: media.uri, type: "image" },
          "photos/upload",
          { is_primary: index === 0 },
        );
        setPhotos((prev) =>
          prev.map((p, i) => (i === index ? { ...p, ...res } : p)),
        );
      } catch (err) {
        showThemedError(`Photo upload failed:\n${err}`, themeColors);
      }
    });
  };

  const [mediaMenuVisible, setMediaMenuVisible] = useState(false);
  const [currentlyUploadingPhotoIndex, setCurrentlyUploadingPhotoIndex] =
    useState(0);
  const handlePhotoSelect = async (media?: MediaPreview) => {
    if (!media) return;
    setUploads((prev) =>
      prev.map((p, i) => (i === currentlyUploadingPhotoIndex ? media : p)),
    );
  };

  const discardEdits = () => {
    setEditingMode(false);
    setNameInput(user?.full_name);
    setBioInput(user?.bio);
    setUploads(Array.from({ length: MAX_PHOTOS }, () => null));
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <SafeAreaView className="flex-1 bg-bgPrimaryLight dark:bg-bgPrimaryDark">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 26,
            paddingTop: 5,
            paddingBottom: insets.bottom + 20,
          }}
          className="flex-1"
        >
          <View className="flex-row items-center">
            {editingMode ? (
              <>
                <TouchableOpacity className="p-3" onPress={discardEdits}>
                  <AntDesign
                    name="close"
                    size={22}
                    color={themeColors.textPrimary}
                  />
                </TouchableOpacity>
                <Text className="font-bold text-2xl text-textPrimaryLight dark:text-textPrimaryDark px-5">
                  Edit
                </Text>
                <View className="flex-1" />
                <TouchableOpacity className="p-3" onPress={() => {}}>
                  <Feather
                    name="check-circle"
                    size={24}
                    color={theme === "dark" ? "lightgreen" : "green"}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View className="flex-1" />
                <TouchableOpacity
                  className="p-3"
                  onPress={() => setEditingMode(true)}
                >
                  <FontAwesome6
                    name="edit"
                    size={24}
                    color={themeColors.textPrimary}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
          <View className="mt-6 flex-row items-center">
            <TouchableOpacity
              onPress={() => {
                if (editingMode) {
                  setCurrentlyUploadingPhotoIndex(0);
                  setMediaMenuVisible(true);
                } else {
                  if (photos[0]?.image_url)
                    openImageViewer(photos[0].image_url);
                }
              }}
              activeOpacity={0.7}
            >
              {photos[0]?.image_url ? (
                <Image
                  source={{ uri: photos[0].image_url }}
                  className="w-36 h-36 rounded-full"
                />
              ) : (
                <FontAwesome
                  name="user-circle"
                  size={96}
                  color={themeColors.textPrimary}
                />
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      <MediaMenuModal
        visible={mediaMenuVisible}
        onDismiss={() => setMediaMenuVisible(false)}
        launchCamera={async () => {
          setMediaMenuVisible(false);
          handlePhotoSelect(
            await launchCamera({
              videosAllowed: false,
              allowsEditing: true,
            }),
          );
        }}
        pickPhoto={async () => {
          setMediaMenuVisible(false);
          handlePhotoSelect(
            await pickMedia({
              videosAllowed: false,
              allowsEditing: true,
            }),
          );
        }}
        hideAudioRecorderAction
      />
    </>
  );
}

//   {/* Name + age + bio */}
//   <View className="flex-1">
//     {editingMode ? (
//       <TextInput
//         value={nameInput}
//         onChangeText={setNameInput}
//         placeholder="Full Name"
//         className="text-2xl font-bold text-textPrimaryLight dark:text-textPrimaryDark border-b border-gray-400 mb-2"
//       />
//     ) : (
//       <Text className="text-2xl font-bold text-textPrimaryLight dark:text-textPrimaryDark">
//         {user.full_name} {age ? `, ${age}` : ""}
//       </Text>
//     )}

//     {editingMode ? (
//       <TextInput
//         value={bioInput}
//         onChangeText={setBioInput}
//         multiline
//         placeholder="Bio"
//         className="mt-2 text-textPrimaryLight dark:text-textPrimaryDark font-regular border-b border-gray-400 p-1"
//       />
//     ) : (
//       <Text className="mt-2 text-textPrimaryLight dark:text-textPrimaryDark font-regular">
//         {bioExpanded
//           ? user.bio
//           : `${user.bio?.slice(0, 100)}${user.bio && user.bio.length > 100 ? "..." : ""}`}
//       </Text>
//     )}

//     {!editingMode && user.bio && user.bio.length > 100 && (
//       <TouchableOpacity onPress={() => setBioExpanded(!bioExpanded)}>
//         <Text className="text-sm font-regular text-gray-400 mt-1">
//           {bioExpanded ? "Show less" : "Read more"}
//         </Text>
//       </TouchableOpacity>
//     )}

//     {/* Interests */}
//     <View className="flex-row flex-wrap mt-3">
//       {user.interests?.map((i) => (
//         <View
//           key={i.id}
//           className="bg-primary/20 px-3 py-1 rounded-full mr-2 mb-2"
//         >
//           <Text className="text-sm font-regular text-textPrimaryLight dark:text-textPrimaryDark">
//             {i.name}
//           </Text>
//         </View>
//       ))}
//       {editingMode && (
//         <TouchableOpacity
//           onPress={() => Alert.alert("Add interest")}
//           className="bg-gray-300 dark:bg-gray-600 px-3 py-1 rounded-full mr-2 mb-2 items-center justify-center"
//         >
//           <Ionicons
//             name="add"
//             size={16}
//             color={themeColors.textPrimary}
//           />
//         </TouchableOpacity>
//       )}
//     </View>
//   </View>

//   {/* Save button */}
//   {editingMode && (
//     <TouchableOpacity
//       onPress={saveProfile}
//       className="absolute top-2 right-0 bg-primary p-2 rounded"
//     >
//       <Text className="text-white font-bold">Save</Text>
//     </TouchableOpacity>
//   )}
// </View>

// {/* Photo Grid */}
// <View className="flex-row flex-wrap justify-start">
//   {photos.map((p, idx) => (
//     <TouchableOpacity
//       key={p.id}
//       onPress={() => handlePhotoUpload(idx)}
//       activeOpacity={0.8}
//       className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-400 items-center justify-center mr-3 mb-3 bg-gray-100"
//     >
//       {p.uri ? (
//         <Image source={{ uri: p.uri }} className="w-24 h-24 rounded-xl" />
//       ) : (
//         <Ionicons
//           name="image-outline"
//           size={28}
//           color={themeColors.textPrimary}
//         />
//       )}
//       {editingMode && (
//         <TouchableOpacity
//           onPress={() => handlePhotoCamera(idx)}
//           className="absolute bottom-0 right-0 bg-primary p-1 rounded-full"
//         >
//           <Ionicons name="camera" size={16} color="#fff" />
//         </TouchableOpacity>
//       )}
//     </TouchableOpacity>
//   ))}
// </View>

// {/* Toggle edit mode */}
// <TouchableOpacity
//   onPress={() => setEditingMode(!editingMode)}
//   className="mt-4 bg-primary p-3 rounded-md items-center justify-center"
// >
//   <Text className="text-white font-bold">
//     {editingMode ? "Cancel Edit" : "Edit Profile"}
//   </Text>
// </TouchableOpacity>
