"use client";
import { useLoadUserData } from "./user-store-initializer";

export default function UserStoreLoader() {
  useLoadUserData();
  return null;
}
