import { useState } from "react";

const STORAGE_KEY = "penny_profile";

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function useFinanceProfile() {
  const [profile, setProfile] = useState(loadProfile);

  function saveProfile(data) {
    setProfile(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  return { profile, saveProfile };
}