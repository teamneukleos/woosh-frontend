export function cartoonAvatar(seed: string) {
  const value = seed.trim() || "woosh";
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(value)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}
