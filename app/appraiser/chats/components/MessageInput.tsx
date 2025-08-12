import { Button } from "@/components/ui/button";
import { Paperclip, Send, Loader2 } from "lucide-react";

interface MessageInputProps {
    newMessage: string;
    setNewMessage: (message: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
    onKeyPress: (e: React.KeyboardEvent) => void;
    sending: boolean;
}

export default function MessageInput({ 
    newMessage, 
    setNewMessage, 
    onSendMessage, 
    onKeyPress, 
    sending 
}: MessageInputProps) {
    return (
        <div
            className="w-full flex items-center justify-center bg-[#2A020D]"
            style={{
                position: "fixed",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
                height: "72px",
                width: "calc(100% - 256px)",
                marginLeft: "128px", // Half of the dashboard width (256px/2)
            }}
        >
      <div className="max-w-4xl w-full mx-auto flex items-center px-0">
        <form
          onSubmit={onSendMessage}
          className="flex gap-3 w-full px-4 py-4"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-white hover:text-blue-200 p-1"
            tabIndex={-1}
          >
          
          </Button>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={onKeyPress}
            disabled={sending}
            className="flex-1 bg-[#E6F9F3] text-gray-900 placeholder:text-gray-500 rounded-full border-none focus:ring-0 py-3 px-3"
            style={{ outline: "none" }}
            maxLength={1000}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-white hover:bg-blue-100 text-[#2A020D] p-3 rounded-full shadow-none"
            style={{ minWidth: 48, minHeight: 48 }}
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
