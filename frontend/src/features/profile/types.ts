export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  age?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface CreateProfileRequest {
  display_name: string;
  age?: number;
  weight?: number;
  height?: number;
}

export interface UpdateProfileRequest {
  display_name?: string;
  age?: number;
  weight?: number;
  height?: number;
}

export interface AvatarUploadURLRequest {
  content_type: string;
}

export interface AvatarUploadURLResponse {
  upload_url: string;
  key: string;
}

export interface AvatarURLResponse {
  url: string;
}
