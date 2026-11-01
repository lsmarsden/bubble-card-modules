// Pin the timezone so time-of-day logic (e.g. separator_as_timeline) is deterministic.
export default function globalSetup() {
  process.env.TZ = "UTC";
}
