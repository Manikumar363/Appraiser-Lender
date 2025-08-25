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
        <div className="w-full flex sticky  items-end justify-center bg-[#2A020D] px-1 md:px-1">
            <form
                onSubmit={onSendMessage}
                className="flex gap-2 md:gap-3 w-full max-w-4xl mx-auto py-3 md:py-4"
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-blue-200 p-1 hidden md:flex" // Hide on mobile if not needed
                    tabIndex={-1}
                >
                    {/* Optional content */}
                </Button>
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={onKeyPress}
                    disabled={sending}
                    className="flex-1 bg-[#E6F9F3] text-gray-900 placeholder:text-gray-500 rounded-full border-none focus:ring-0 py-2 md:py-3 px-3 md:px-4 text-sm md:text-base"
                    style={{ outline: "none" }}
                    maxLength={1000}
                />
                <Button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-white hover:bg-blue-100 text-[#2A020D] p-2 md:p-3 rounded-full shadow-none"
                    style={{ minWidth: 40, minHeight: 40 }} // Smaller on mobile
                >
                    {sending ? (
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                </Button>
            </form>
        </div>
    );
}
