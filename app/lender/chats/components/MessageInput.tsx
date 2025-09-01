import React /*, { useRef } */ from "react";
import { Button } from "@/components/ui/button";
import { /* Paperclip, */ Send, Loader2 } from "lucide-react";
// import axios from "axios";

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
  // const fileInputRef = useRef<HTMLInputElement>(null);

  // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (!files || files.length === 0) return;
  //   const formData = new FormData();
  //   for (let i = 0; i < files.length; i++) formData.append("files", files[i]);
  //   try {
  //     const single = files.length === 1;
  //     await axios.post(single ? "/upload" : "/upload/multiple", formData, {
  //       headers: { "Content-Type": "multipart/form-data" }
  //     });
  //   } catch {
  //     // TODO: toast error
  //   }
  // };

  return (
    <div
      className="
        fixed bottom-0 left-0 z-10 w-full
        bg-[#2A020D] border-t border-[#441825]
-        lg:ml-64 lg:w-[calc(100%-16rem)]
+        xl:ml-64 xl:w-[calc(100%-16rem)]
        shadow-[0_-2px_4px_rgba(0,0,0,0.15)]
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <div
        className="
          mx-auto w-full
          px-2 sm:px-4 md:px-6
          max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl
        "
      >
        <form
          onSubmit={onSendMessage}
          className="
            flex items-center
            gap-2 sm:gap-3 md:gap-4
            py-2.5 sm:py-3 md:py-4
          "
        >
          {/*
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="
              text-white hover:text-blue-200
              p-2 sm:p-2 md:p-2.5
            "
            tabIndex={-1}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5 md:w-6 md:h-6" />
            <span className="sr-only">Attach files</span>
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,image/png,image/jpeg,image/jpg"
            multiple
            onChange={handleFileChange}
          />
          */}

          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={onKeyPress}
            disabled={sending}
            maxLength={1000}
            className="
              flex-1
              bg-[#FBEFF2]
              text-gray-900 placeholder:text-gray-500
              rounded-full
              border-none
              focus:ring-2 focus:ring-pink-300 focus:outline-none
              text-sm sm:text-base md:text-[17px]
              py-2.5 sm:py-3 md:py-3.5
              px-4 sm:px-5 md:px-6
              disabled:opacity-60
            "
          />

            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="
                bg-white hover:bg-[#FBEFF2] text-[#2A020D]
                rounded-full shadow-none
                p-3 sm:p-3 md:p-4
                disabled:opacity-60
                flex items-center justify-center
              "
              style={{ minWidth: 44, minHeight: 44 }}
            >
              {sending
                ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                : <Send className="w-5 h-5 md:w-6 md:h-6" />
              }
              <span className="sr-only">Send message</span>
            </Button>
        </form>
      </div>
    </div>
  );
}
