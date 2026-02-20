import { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { pickMedia, launchCamera } from "@/services/media-picker";

const MAX_PHOTOS = 6;

// Dummy types
type Photo = { id: string; uri?: string; };
type Interest = { id: number; name: string };
type User = { full_name?: string; bio?: string; date_of_birth?: string; interests?: Interest[] };

export default function ProfileScreen() {
  const { themeColors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  const [user, setUser] = useState<User>({
    full_name: "Jane Doe",
    bio: "Hello world! This is a long bio that should be expandable to show more text when in read more mode.",
    date_of_birth: "1995-01-01",
    interests: [{ id: 1, name: "Music" }, { id: 2, name: "Travel" }],
  });

  const [nameInput, setNameInput] = useState(user.full_name);
  const [bioInput, setBioInput] = useState(user.bio);
  const [photos, setPhotos] = useState<Photo[]>(Array.from({ length: MAX_PHOTOS }, (_, i) => ({ id: `p${i}` })));

  const age = user.date_of_birth ? new Date().getFullYear() - new Date(user.date_of_birth).getFullYear() : "";

  const saveProfile = () => {
    setUser(prev => ({ ...prev, full_name: nameInput, bio: bioInput }));
    setEditing(false);
  };

  const handlePhotoUpload = async (idx: number) => {
    const media = await pickMedia({ videosAllowed: false });
    if (media) {
      setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, uri: media.uri } : p));
    }
  };

  const handlePhotoCamera = async (idx: number) => {
    const media = await launchCamera();
    if (media) {
      setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, uri: media.uri } : p));
    }
  };

  return (
    <ScrollView className="flex-1 bg-bgPrimaryLight dark:bg-bgPrimaryDark p-5">
      {/* Header */}
      <View className="flex-row items-start space-x-5 mb-6">
        {/* Profile picture */}
        <TouchableOpacity onPress={() => handlePhotoUpload(0)} activeOpacity={0.7} className="relative">
          {photos[0].uri ? (
            <Image source={{ uri: photos[0].uri }} className="w-36 h-36 rounded-full" />
          ) : (
            <View className="w-36 h-36 rounded-full border-4 border-dashed border-gray-400 items-center justify-center bg-gray-200">
              <Ionicons name="person" size={60} color={themeColors.textPrimary} />
            </View>
          )}
          {editing && (
            <View className="absolute bottom-0 right-0 bg-primary/30 p-2 rounded-full">
              <Ionicons name="create-outline" size={22} color={themeColors.textPrimary} />
            </View>
          )}
        </TouchableOpacity>

        {/* Name + age + bio */}
        <View className="flex-1">
          {editing ? (
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Full Name"
              className="text-2xl font-bold text-textPrimaryLight dark:text-textPrimaryDark border-b border-gray-400 mb-2"
            />
          ) : (
            <Text className="text-2xl font-bold text-textPrimaryLight dark:text-textPrimaryDark">
              {user.full_name} {age ? `, ${age}` : ""}
            </Text>
          )}

          {editing ? (
            <TextInput
              value={bioInput}
              onChangeText={setBioInput}
              multiline
              placeholder="Bio"
              className="mt-2 text-textPrimaryLight dark:text-textPrimaryDark font-regular border-b border-gray-400 p-1"
            />
          ) : (
            <Text className="mt-2 text-textPrimaryLight dark:text-textPrimaryDark font-regular">
              {bioExpanded ? user.bio : `${user.bio?.slice(0, 100)}${user.bio && user.bio.length > 100 ? "..." : ""}`}
            </Text>
          )}

          {!editing && user.bio && user.bio.length > 100 && (
            <TouchableOpacity onPress={() => setBioExpanded(!bioExpanded)}>
              <Text className="text-sm font-regular text-gray-400 mt-1">
                {bioExpanded ? "Show less" : "Read more"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Interests */}
          <View className="flex-row flex-wrap mt-3">
            {user.interests?.map(i => (
              <View key={i.id} className="bg-primary/20 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-sm font-regular text-textPrimaryLight dark:text-textPrimaryDark">{i.name}</Text>
              </View>
            ))}
            {editing && (
              <TouchableOpacity
                onPress={() => Alert.alert("Add interest")}
                className="bg-gray-300 dark:bg-gray-600 px-3 py-1 rounded-full mr-2 mb-2 items-center justify-center"
              >
                <Ionicons name="add" size={16} color={themeColors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Save button */}
        {editing && (
          <TouchableOpacity
            onPress={saveProfile}
            className="absolute top-2 right-0 bg-primary p-2 rounded"
          >
            <Text className="text-white font-bold">Save</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Photo Grid */}
      <View className="flex-row flex-wrap justify-start">
        {photos.map((p, idx) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => handlePhotoUpload(idx)}
            activeOpacity={0.8}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-400 items-center justify-center mr-3 mb-3 bg-gray-100"
          >
            {p.uri ? (
              <Image source={{ uri: p.uri }} className="w-24 h-24 rounded-xl" />
            ) : (
              <Ionicons name="image-outline" size={28} color={themeColors.textPrimary} />
            )}
            {editing && (
              <TouchableOpacity
                onPress={() => handlePhotoCamera(idx)}
                className="absolute bottom-0 right-0 bg-primary p-1 rounded-full"
              >
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Toggle edit mode */}
      <TouchableOpacity
        onPress={() => setEditing(!editing)}
        className="mt-4 bg-primary p-3 rounded-md items-center justify-center"
      >
        <Text className="text-white font-bold">{editing ? "Cancel Edit" : "Edit Profile"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
