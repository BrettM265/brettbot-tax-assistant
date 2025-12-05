import ChatShell from "./components/chatshell";
export default function Home() {

  return (
<div className="w-full min-h-screen flex items-center justify-center bg-blue-50 dark:bg-gray-950 transition-colors duration-300">
  <ChatShell />
</div>
);
}
