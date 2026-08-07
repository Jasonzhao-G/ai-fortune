/** 根据当前时段返回灵宠主动问候语 */
export function getSpiritPetTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) {
    return "主人早上好，今天想问点什么？";
  }
  if (hour >= 9 && hour < 12) {
    return "主人上午好，吃早饭了没？今天想问点什么？";
  }
  if (hour >= 12 && hour < 14) {
    return "主人中午好，吃午饭了吗？今天想问点什么？";
  }
  if (hour >= 14 && hour < 18) {
    return "主人下午好，今天想问点什么？";
  }
  return "主人晚上好，今天想问点什么？答应我一定要好好睡觉觉哦~";
}
