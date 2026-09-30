export function signVideosdkTokens(opts: {
  apikey: string;
  secret: string;
  expiresIn?: string;
}): { rtc: string; crawler: string };

export function resolveVideosdkTokens(env: Record<string, string | undefined>): {
  rtc: string;
  crawler: string;
};
