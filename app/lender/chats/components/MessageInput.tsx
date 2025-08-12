import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Loader2 } from "lucide-react";
import axios from "axios";

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection and upload
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        try {
            let response;
            if (files.length === 1) {
                response = await axios.post("/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                response = await axios.post("/upload/multiple", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            // You can now use response.data to send the file URLs as messages
            // For example, call setNewMessage with the file URL or trigger a send
            // setNewMessage(response.data.url); // For single file 
            // setNewMessage(response.data.urls.join(", ")); // For multiple files
            // Or trigger your send message logic here
        } catch (error) {
            // Handle error (show toast, etc.)
        }
    };

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
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept=".pdf,image/png,image/jpeg,image/jpg"
                        multiple
                        onChange={handleFileChange}
                    />
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={onKeyPress}
                        disabled={sending}
                        className="flex-1 bg-[#FBEFF2] text-gray-900 placeholder:text-gray-500 rounded-full border-none focus:ring-0 py-3 px-3"
                        style={{ outline: "none" }}
                        maxLength={1000}
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-white hover:bg-[#FBEFF2] text-[#2A020D] p-3 rounded-full shadow-none"
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
