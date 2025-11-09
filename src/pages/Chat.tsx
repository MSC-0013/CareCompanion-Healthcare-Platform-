import { useState, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import { getCurrentUser } from "@/lib/auth";
import { saveMessage, getMessages, clearMessages, type ChatMessage } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Trash2,
  Heart,
  Calendar,
  Stethoscope,
  Pill,
  Activity,
  Clock,
  Shield,
  Brain,
  User,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

// Quick Prompt Buttons
const quickPrompts = [
  { icon: Stethoscope, text: "Symptom Check", prompt: "I have a fever and headache" },
  { icon: Pill, text: "Medication Info", prompt: "Tell me medicines for diabetes" },
  { icon: Activity, text: "Wellness", prompt: "Give me wellness tips" },
  { icon: Heart, text: "Heart Health", prompt: "How to improve heart health" },
  { icon: Brain, text: "Mental Health", prompt: "How to manage stress" },
  { icon: Shield, text: "Prevention", prompt: "How to prevent malaria" },
];

interface HealthcareRow {
  disease?: string;
  symptoms?: string;
  overview?: string;
  treatment?: string;
  prevention?: string;
  medication?: string;
  causes?: string;
}

const Chat = () => {
  const user = getCurrentUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<HealthcareRow[]>([]);
  const [fuse, setFuse] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    loadCSV();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const loadMessages = async () => {
    const saved = await getMessages();
    setMessages(saved.sort((a, b) => a.timestamp - b.timestamp));
  };

  // 🔹 Smart CSV loader + Fuse.js setup
  const loadCSV = async () => {
    try {
      const response = await fetch("/Healthcare.csv");
      const text = await response.text();

      const rows = text.split(/\r?\n/).map((r) => r.trim()).filter((r) => r.length > 0);
      const headers = rows[0]
        .split(",")
        .map((h) => h.trim().replace(/['"]+/g, "").toLowerCase());

      const parsed: HealthcareRow[] = rows.slice(1).map((line) => {
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // handles commas inside quotes
        const obj: HealthcareRow = {};
        headers.forEach((h, i) => (obj[h] = (cols[i] || "").replace(/['"]+/g, "").trim()));
        return obj;
      });

      setData(parsed);

      const fuseInstance = new Fuse(parsed, {
        keys: ["disease", "symptoms"],
        threshold: 0.4,
        ignoreLocation: true,
      });
      setFuse(fuseInstance);

      console.log("✅ Loaded CSV:", parsed.length, "records");
    } catch (error) {
      console.error("CSV load error:", error);
      toast.error("Failed to load healthcare data");
    }
  };

  // 🔹 Smarter keyword matching and deep-dive responses
  // 🔹 Smart Word-by-Word Matching, Personality & Deep Healthcare Intelligence
  const findResponse = (message: string) => {
    const msg = message.toLowerCase().trim();
    if (!data || data.length === 0)
      return "⚠️ Healthcare data is still loading. Please wait a few seconds.";

    // 💬 1️⃣ Small Talk, Greetings & Personality
    const smallTalkTriggers: Record<string, string> = {
      hi: "👋 Hey there! I’m CareCompanion — your personal AI healthcare partner 💙",
      hello: "👋 Hello! How are you feeling today? I’m here to guide your health journey 🩺",
      hey: "🙌 Hey! I’m CareCompanion — always ready to assist you with your health questions 💡",
      "who are you":
        "🤖 I’m CareCompanion Pro+, your smart healthcare assistant created to help you understand wellness, diseases, and lifestyle better 🌿",
      "who made you":
        "👩‍💻 I was built by passionate minds at Gandhi Engineering College to empower healthcare accessibility through AI 💪",
      "how do you work":
        "⚙️ I analyze your health-related questions using curated medical data to provide reliable insights — no heavy models, just smart logic 🧠",
      "are you a doctor":
        "🩺 I’m not a doctor, but I share verified healthcare info to help you make informed decisions 👨‍⚕️",
      "what can you do":
        "📘 I can explain diseases, symptoms, treatments, medications, prevention methods, and daily wellness tips 🌼",
      "how old are you":
        "📅 I’m as young as the latest medical knowledge — updated with the best healthcare insights 💡",
      "how are you":
        "😊 I’m great and ready to help you stay healthy! How are you doing today?",
      "how are you today":
        "🌤️ Feeling energetic as always! Let’s make your day healthier together 💪",
      "i need help":
        "💙 I’m here for you. Please share your symptoms or ask about a disease so I can assist 🩺",
      "can you help me":
        "💬 Of course! I can guide you through symptoms, diseases, and health routines for better living ❤️",
      "tell me about yourself":
        "💡 I’m CareCompanion — your AI wellness partner, designed to make health understanding simple, accurate, and human 🤝",
      "thank you":
        "🙏 You’re most welcome! Your health and happiness mean the world to me 💙",
      thanks:
        "🤗 Glad I could help! Remember — consistency and care build great health 🌿",
      "good morning":
        "🌞 Good morning! A glass of water, a smile, and a healthy breakfast — the best way to start your day 💧",
      "good afternoon":
        "☀️ Good afternoon! Stay hydrated and take a short walk or stretch to re-energize 🏃‍♂️",
      "good evening":
        "🌆 Good evening! Take a deep breath, unwind, and remember — relaxation heals too 🧘",
      "good night":
        "🌙 Good night! Rest well — your body repairs itself while you sleep 😴",
      "how to stay fit":
        "💪 Consistency is key! Exercise daily, stay hydrated, and eat balanced meals 🌽",
      "how to stay healthy":
        "🌿 Eat clean, sleep enough, move daily, and smile often — health is holistic ❤️",
      "how do i stay healthy":
        "🌱 Focus on nutrition, regular movement, good sleep, and mindful peace — your body will thank you 💚",
      "how to eat healthy":
        "🥗 Choose whole foods, cut down sugar, hydrate well, and enjoy meals mindfully 🍎",
      "i feel tired":
        "😴 You might be tired due to stress, dehydration, or lack of rest. Hydrate, stretch, and take a deep breath 🌬️",
      "i have pain":
        "😟 I’m sorry you’re in pain. Please share where it hurts — I can suggest possible causes or helpful care info 💊",
      "tell me a fact":
        "🧬 Did you know? Laughing improves blood flow and boosts immunity — laughter truly is medicine! 😂",
      "what is carecompanion":
        "💙 CareCompanion Pro+ is your all-in-one AI-powered health companion, helping you live smarter and healthier every day 🩺",
      "who created you":
        "👨‍💻 I was built by talented students and engineers to combine AI with wellness education 💡",
      "what’s up":
        "😄 Just spreading good health vibes! How can I support your wellbeing today?",
      "how do you feel":
        "🤖 I feel great when I can help someone take a small step toward better health 🌈",
      "how do i contact you":
        "📧 You can reach me right here — I’m always available to assist you anytime, anywhere 💬",
      "what is your purpose":
        "🎯 My purpose is to make healthcare understandable and accessible — knowledge saves lives ❤️",
      "who is your developer":
        "👨‍💻 I was developed by passionate AI engineers to create accessible, intelligent healthcare support 🌍",
      "how can you assist me":
        "🩺 I can help identify diseases, explain symptoms, and share treatments and prevention tips 💊",
      "i’m bored":
        "🎮 How about some quick wellness trivia? Did you know that walking 20 minutes daily reduces heart disease risk by 30%? 💖",
      "i feel sad":
        "💙 You’re not alone — try slow breathing, calm music, or journaling your thoughts 🫶",
      "i feel anxious":
        "🧘 Deep breaths help. Inhale 4s, hold 4s, exhale 6s — repeat and relax 💪",
      "how can i sleep better":
        "😴 Avoid screens before bed, keep your room cool, and have a bedtime routine 🕯️",
      "what is life":
        "🌍 Life’s beautiful when you nurture your health — mind, body, and soul ✨",
      "are you real":
        "🤖 I’m digital, but my care for your wellbeing is 100% real 💙",
      "how’s the weather":
        "🌤️ The weather may change, but hydration and self-care never go out of season 💧",
    };

    for (const [key, val] of Object.entries(smallTalkTriggers)) {
      if (msg.includes(key)) return val;
    }

    // 🧘‍♀️ 2️⃣ Wellness & Lifestyle Prompts
    if (msg.includes("wellness tip") || msg.includes("stay healthy") || msg.includes("health tip")) {
      return `🌿 **Daily Wellness Tips:**  
🥗 Eat whole foods and hydrate.  
🏃‍♂️ Exercise 30 mins daily.  
😴 Sleep 7–8 hours.  
🧘‍♀️ Manage stress through hobbies.  
💧 Consistency is the best medicine!`;
    }

    if (msg.includes("heart health") || msg.includes("improve heart")) {
      return `❤️ **Heart Health Tips:**  
💪 Walk, jog, or cycle regularly.  
🥗 Eat leafy greens, oats, and olive oil.  
🚭 Avoid smoking & reduce sodium.  
🩺 Monitor cholesterol and BP regularly.`;
    }

    if (msg.includes("manage stress") || msg.includes("stress relief") || msg.includes("relax")) {
      return `🧘 **Stress Relief Tips:**  
🌤️ Try breathing or yoga.  
🎶 Listen to calm music.  
💬 Talk to a friend or counselor.  
💤 Sleep is the best reset.`;
    }

    if (msg.includes("prevent malaria") || msg.includes("avoid malaria")) {
      return `🦟 **Malaria Prevention:**  
🛏️ Use mosquito nets & repellents.  
💧 Remove stagnant water.  
🚫 Cover skin at dusk/dawn.  
💊 Take prophylaxis if traveling to risk zones.`;
    }

    // ⚕️ 3️⃣ Word-by-Word Disease/Symptom Matching
    const words = msg
      .replace(/[^\w\s-]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2); // ignore short words like "is", "a", "to"

    const matches: HealthcareRow[] = [];
    const scores: Record<string, number> = {};

    for (const row of data) {
      const diseaseName = (row.disease || "").toLowerCase();
      const symptoms = (row.symptoms || "").toLowerCase();

      for (const word of words) {
        if (diseaseName.includes(word) || symptoms.includes(word)) {
          if (!matches.find((m) => m.disease === row.disease)) {
            matches.push(row);
            scores[row.disease || ""] = 1;
          } else {
            scores[row.disease || ""] += 1;
          }
        }
      }
    }

    if (matches.length === 0)
      return "❌ I couldn’t find any disease or symptom matching your query. Try words like *malaria*, *fever*, *covid*, or *diabetes* 🩺";

    // Sort matches by score (most relevant first)
    matches.sort((a, b) => (scores[b.disease || ""] || 0) - (scores[a.disease || ""] || 0));

    // 🩺 4️⃣ Build the full detailed response
    // 🩺 4️⃣ Build the full detailed response
    let response = `🌿 **Detailed Medical Insights**\n\n`;

    matches.slice(0, 4).forEach((r) => {
      // 🧩 Normalize and gracefully handle missing / case variations
      const name = r.disease || r.Disease || "Unknown Disease";
      const overview = r.overview || r.Overview || "No overview available.";
      const symptoms = r.symptoms || r.Symptoms || "Not listed.";
      const treatment = r.treatment || r.Treatment || "No treatment data.";
      const medications =
        r.medications || r.medication || r.Medications || "No medicines listed.";
      const cautions =
        r.cautions || r.causes || r.Caution || r.Causes || "No caution info.";
      const prevention =
        r.prevention || r.Prevention || "No prevention info.";

      // 🎨 Add better emojis, spacing, and hierarchy for readability
      matches.slice(0, 4).forEach((r) => {
        // Normalize fields safely
        const name = r.disease || r.Disease || "Unknown Disease";
        const overview = r.overview || r.Overview || "No overview available.";
        const symptoms = r.symptoms || r.Symptoms || "Not listed.";
        const treatment = r.treatment || r.Treatment || "No treatment data.";
        const medications =
          r.medications || r.medication || r.Medications || "No medicines listed.";
        const cautions =
          r.cautions || r.causes || r.Caution || r.Causes || "No caution info.";
        const prevention =
          r.prevention || r.Prevention || "No prevention info.";

        // 🪄 Elegant Markdown layout with smooth dividers and section style
        response += `🌿 **Detailed Medical Insights**\n\n`;
        response += `💠 **${name.toUpperCase()}** 💠\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `📘 **Overview:** ${overview}\n\n`;
        response += `🩺 **Symptoms:** ${symptoms}\n\n`;
        response += `💊 **Treatment:** ${treatment}\n\n`;
        response += `💉 **Medications:** ${medications}\n\n`;
        response += `⚠️ **Cautions:** ${cautions}\n\n`;
        response += `🛡️ **Prevention:** ${prevention}\n\n`;

        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      });

    });


    response +=
      "⚕️ **Disclaimer:** This info is educational only. Always consult a licensed doctor for accurate medical advice.";

    return response;
  };


  const handleSend = async (custom?: string) => {
    const messageText = custom || input;
    if (!messageText.trim() || isLoading) return;

    // 👤 Save and display user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    };

    setInput("");
    setIsLoading(true);
    setMessages((prev) => [...prev, userMessage]);
    await saveMessage(userMessage);

    // ⏳ Temporary assistant typing placeholder
    const loadingMessage: ChatMessage = {
      id: "loading",
      role: "assistant",
      content: "typing...",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, loadingMessage]);

    // ✨ Smooth typing animation without weird symbols
    const animateTyping = async (finalText: string) => {
      const words = finalText.split(" ");
      let displayed = "";

      for (let i = 0; i < words.length; i++) {
        displayed += words[i] + " ";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === "loading" ? { ...m, content: displayed.trim() } : m
          )
        );
        await new Promise((r) => setTimeout(r, words[i].endsWith('.') ? 400 : 25));

      }

      // Replace loading message with final AI response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "loading"),
        {
          id: Date.now().toString(),
          role: "assistant",
          content: finalText.trim(),
          timestamp: Date.now(),
        },
      ]);
    };

    try {
      const replyText = findResponse(messageText);

      // Save the final AI message in DB
      await saveMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replyText,
        timestamp: Date.now(),
      });

      // 🧠 Animate the typing of the AI response
      await animateTyping(replyText);
    } catch (err) {
      console.error("❌ Error generating response:", err);
      toast.error("Something went wrong while generating the response.");
      setMessages((prev) => prev.filter((m) => m.id !== "loading"));
    } finally {
      setIsLoading(false);
    }
  };


  const handleClear = async () => {
    await clearMessages();
    setMessages([]);
    toast.success("Chat cleared");
  };

  const formatTime = (t: number) =>
    new Date(t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const groupByDate = (msgs: ChatMessage[]) => {
    const grouped: { [key: string]: ChatMessage[] } = {};
    msgs.forEach((m) => {
      const date = new Date(m.timestamp).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(m);
    });
    return grouped;
  };

  const messageGroups = groupByDate(messages);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />

      <div className="w-full bg-white border-b border-gray-200 px-4 py-2 flex justify-end">
        <Button
          size="sm"
          variant="outline"
          className="text-black border-gray-300 hover:bg-gray-100"
          onClick={handleClear}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Clear
        </Button>
      </div>

      <main className="flex-1 flex justify-center items-center w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4">
        <Card className="w-full h-[calc(100vh-120px)] flex flex-col border-none bg-white shadow-none overflow-hidden">
          <ScrollArea ref={scrollRef} className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white">
            {messages.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full space-y-8 text-center px-4">
                <div className="w-24 h-24 bg-blue-100 flex items-center justify-center rounded-full shadow-md">
                  <Heart className="h-12 w-12 text-blue-600" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-black">
                    Welcome, {user?.name || "User"} 💬
                  </h2>
                  <p className="text-gray-700 max-w-md text-base sm:text-lg">
                    I’m your healthcare assistant — ask me about diseases, symptoms, or prevention tips.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl w-full">
                  {quickPrompts.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSend(item.prompt)}
                        className="flex flex-col items-center justify-center text-center border border-gray-200 rounded-xl p-4 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <Icon className="h-7 w-7 text-blue-600 mb-2" />
                        <span className="text-sm font-medium text-black">{item.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-5xl mx-auto">
                {Object.entries(messageGroups).map(([date, msgs]) => (
                  <div key={date} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Separator className="flex-1 bg-gray-200" />
                      <Badge variant="outline" className="bg-gray-100 text-black px-3 py-1">
                        <Calendar className="h-3 w-3 mr-1" /> {date}
                      </Badge>
                      <Separator className="flex-1 bg-gray-200" />
                    </div>

                    {msgs.map((m) => (
                      <div
                        key={m.id}
                        className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {m.role === "assistant" && (
                          <Avatar className="h-9 w-9 mt-1">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              <Bot className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-4 shadow-sm transition-all duration-300 ${m.role === "user"
                            ? "bg-gradient-to-r from-orange-300 to-orange-500 text-white shadow-md hover:shadow-lg border border-orange-400 animate-[glowPulse_3s_ease-in-out_infinite]"
                            : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                            }`}
                          style={{
                            boxShadow:
                              m.role === "user"
                                ? "0 0 12px rgba(255, 165, 0, 0.3)"
                                : "0 2px 6px rgba(0, 0, 0, 0.05)",
                          }}
                        >


                          <div className="prose prose-sm max-w-none text-sm leading-relaxed text-black dark:text-white">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>

                          <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                            <Clock className="h-3 w-3" /> {formatTime(m.timestamp)}
                          </div>
                        </div>
                        {m.role === "user" && (
                          <Avatar className="h-9 w-9 mt-1">
                            <AvatarFallback className="bg-gray-600 text-white">
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 sm:p-6 border-t bg-white flex gap-3 items-center"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about symptoms, prevention, or treatment..."
              disabled={isLoading}
              className="flex-1 backdrop-blur-lg bg-white/60 border border-orange-300 
             focus:border-orange-500 focus:ring-2 focus:ring-orange-400/40 
             rounded-xl text-gray-900 placeholder-gray-500 h-12 px-5 
             shadow-md hover:shadow-lg transition-all duration-200"
            />

            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 text-sm flex items-center gap-2 h-12"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="h-5 w-5" /> Send
                </>
              )}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Chat;
