import { Redirect } from "expo-router";

export default function StartPage() {
  // Langsung arahkan ke halaman Welcome saat aplikasi pertama kali dibuka
  return <Redirect href="./Welcome" />;
}
