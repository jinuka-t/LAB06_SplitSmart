import { readGroups } from "./database";
import Workspace from "./workspace";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <Workspace groups={await readGroups()} />;
}
