import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "FoodSport — твой ИИ-тренер", description: "Дневник питания, вес и тренировки" };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ru"><body>{children}</body></html>}
