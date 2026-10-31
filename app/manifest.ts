import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
 return { name:"FoodSport", short_name:"FoodSport", description:"Питание, тренировки и прогресс", start_url:"/foodsport/", display:"standalone", background_color:"#f5f7f6", theme_color:"#102d32", lang:"ru" };
}