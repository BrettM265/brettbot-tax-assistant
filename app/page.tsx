import ChatShell from "./components/chatshell";
export default function Home() {

  {/* Refresh Page Function */}
  const handleRefresh = () => {
  window.location.reload();
  };

  return (
<div className="w-full min-h-screen flex items-center justify-center bg-blue-50">
  <ChatShell />
  {/* old chat container */}
</div>
);
}
