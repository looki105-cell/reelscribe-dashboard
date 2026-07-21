export type SavedReel = {
  id: string;
  post_id: string;
  url: string;
  frame_url: string | null;
  frame_status: "pending" | "ok" | "stale";
  thumbnail_url: string | null;
  transcript: string | null;
  word_count: number | null;
  caption: string | null;
  tags: string[];
  user_id: string;
  created_at: string;
  synced_at: string;
};

export type SyncKey = {
  id: string;
  user_id: string;
  key_hash: string;
  label: string | null;
  created_at: string;
  revoked_at: string | null;
};
