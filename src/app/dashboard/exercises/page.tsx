"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wind, Play, Pause, RotateCcw, CheckCircle2, HeartPulse, Brain, Waves, PenLine, ChevronRight } from "lucide-react";

type BreathingState = "idle" | "inhale" | "hold1" | "exhale" | "hold2";

export default function ExercisesPage() {
  // Breathing Tool State
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingState>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // Thought Record (CBT) State
  const [thoughtRecord, setThoughtRecord] = useState({
    situation: "",
    thought: "",
    emotion: "",
    reframe: ""
  });
  const [step, setStep] = useState(1);
  const [savedRecords, setSavedRecords] = useState<{ date: string, situation: string, reframe: string }[]>([]);

  // 4-7-8 Timing
  const pattern = { inhale: 4, hold1: 7, exhale: 8, hold2: 0 };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Move to next phase
            if (phase === "inhale") {
              setPhase("hold1");
              return pattern.hold1;
            } else if (phase === "hold1") {
              setPhase("exhale");
              return pattern.exhale;
            } else if (phase === "exhale") {
              if (pattern.hold2 > 0) {
                setPhase("hold2");
                return pattern.hold2;
              } else {
                setCycles((c) => c + 1);
                setPhase("inhale");
                return pattern.inhale;
              }
            } else if (phase === "hold2") {
              setCycles((c) => c + 1);
              setPhase("inhale");
              return pattern.inhale;
            }
          }
          return prev - 1;
        });
        setTotalTime((t) => t + 1);
      }, 1000);
    } else if (!isActive && phase !== "idle") {
      setPhase("idle");
      setTimeLeft(0);
    }

    return () => clearInterval(interval);
  }, [isActive, phase, pattern]);

  const toggleBreathing = () => {
    if (!isActive) {
      setPhase("inhale");
      setTimeLeft(pattern.inhale);
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const getInstruction = () => {
    if (!isActive) return "Ready to start";
    switch (phase) {
      case "inhale": return "Breathe In...";
      case "hold1": return "Hold Breath...";
      case "exhale": return "Breathe Out...";
      case "hold2": return "Hold...";
      default: return "";
    }
  };

  const getProgress = () => {
    if (!isActive) return 0;
    const currentMax = pattern[phase as keyof typeof pattern] || 1;
    return ((currentMax - timeLeft) / currentMax) * 100;
  };

  const saveThoughtRecord = () => {
    if (thoughtRecord.situation && thoughtRecord.reframe) {
      setSavedRecords([{
        date: new Date().toLocaleDateString(),
        situation: thoughtRecord.situation,
        reframe: thoughtRecord.reframe,
      }, ...savedRecords]);
      setThoughtRecord({ situation: "", emotion: "", thought: "", reframe: "" });
      setStep(1);
    }
  };

  return (
    <div>
      <DashboardHeader
        title="Wellness Exercises"
        description="Interactive tools to manage stress and stay grounded"
      />

      <div className="p-6 md:max-w-4xl mx-auto space-y-6">
        <Tabs defaultValue="breathing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="breathing" className="gap-2">
              <Wind className="h-4 w-4" /> Breathing
            </TabsTrigger>
            <TabsTrigger value="grounding" className="gap-2">
              <Waves className="h-4 w-4" /> Grounding
            </TabsTrigger>
            <TabsTrigger value="reframing" className="gap-2">
              <Brain className="h-4 w-4" /> Reframing
            </TabsTrigger>
          </TabsList>

          {/* Breathing Exercises */}
          <TabsContent value="breathing" className="space-y-6">
            <Card className="text-center overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader className="pb-8">
                <CardTitle className="text-xl">4-7-8 Relaxation Breath</CardTitle>
                <CardDescription>A powerful technique to reduce anxiety and promote sleep.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-8 pb-10">
                <div className="relative flex items-center justify-center h-48 w-48">
                  {/* Outer circle animation */}
                  <div className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ease-in-out ${isActive ? "border-primary opacity-30" : "border-muted"
                    } ${phase === "inhale" ? "scale-110" : phase === "exhale" ? "scale-90" : "scale-100"}`} />

                  {/* Inner dynamic circle */}
                  <div className={`absolute flex items-center justify-center rounded-full bg-primary/10 transition-all duration-1000 ease-in-out ${phase === "inhale" ? "h-44 w-44" : phase === "exhale" ? "h-32 w-32" : isActive ? "h-40 w-40" : "h-32 w-32"
                    }`}>
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-primary uppercase tracking-wider mb-1">
                        {getInstruction()}
                      </span>
                      {isActive && (
                        <span className="text-4xl font-light tabular-nums text-foreground">
                          {timeLeft}s
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>Phase Progress</span>
                  </div>
                  <Progress value={getProgress()} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="justify-center gap-4 py-6 bg-muted/30 border-t">
                <Button
                  size="lg"
                  onClick={toggleBreathing}
                  className={isActive ? "bg-amber-500 hover:bg-amber-600" : ""}
                >
                  {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isActive ? "Pause Exercise" : "Start Breathing"}
                </Button>
                {cycles > 0 && !isActive && (
                  <Button variant="outline" size="lg" onClick={() => { setCycles(0); setTotalTime(0); }}>
                    <RotateCcw className="h-4 w-4 mr-2" /> Reset
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Time</p>
                    <p className="text-2xl font-bold tabular-nums">
                      {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <HeartPulse className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Cycles Completed</p>
                    <p className="text-2xl font-bold tabular-nums">{cycles}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Grounding Tab */}
          <TabsContent value="grounding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>5-4-3-2-1 Grounding</CardTitle>
                <CardDescription>Use your senses to return to the present moment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { step: 5, label: "Things you can SEE", desc: "Look around and name 5 objects." },
                  { step: 4, label: "Things you can FEEL", desc: "Notice 4 things you can physically feel." },
                  { step: 3, label: "Things you can HEAR", desc: "Listen for 3 distinct sounds." },
                  { step: 2, label: "Things you can SMELL", desc: "Identify 2 smells around you." },
                  { step: 1, label: "Thing you can TASTE", desc: "Notice 1 thing you can taste, or take a sip of water." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{s.label}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reframing Tab */}
          <TabsContent value="reframing" className="space-y-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader>
                <CardTitle>Cognitive Reframing</CardTitle>
                <CardDescription>Challenge and change negative thought patterns into more balanced ones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="space-y-2">
                      <Label htmlFor="situation">1. What is the situation?</Label>
                      <Textarea
                        id="situation"
                        placeholder="e.g., I made a mistake on a presentation at work."
                        value={thoughtRecord.situation}
                        onChange={(e) => setThoughtRecord({ ...thoughtRecord, situation: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emotion">What emotion are you feeling?</Label>
                      <Input
                        id="emotion"
                        placeholder="e.g., Anxious, Embarrassed (7/10)"
                        value={thoughtRecord.emotion}
                        onChange={(e) => setThoughtRecord({ ...thoughtRecord, emotion: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={() => setStep(2)}
                      disabled={!thoughtRecord.situation || !thoughtRecord.emotion}
                    >
                      Next Step <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="space-y-2">
                      <Label htmlFor="thought">2. What is the negative thought?</Label>
                      <Textarea
                        id="thought"
                        placeholder="e.g., I am completely incompetent and everyone thinks I am a failure."
                        value={thoughtRecord.thought}
                        onChange={(e) => setThoughtRecord({ ...thoughtRecord, thought: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={() => setStep(3)}
                      disabled={!thoughtRecord.thought}
                    >
                      Next Step <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>
                      Back
                    </Button>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="space-y-2">
                      <Label htmlFor="reframe">3. What is a more balanced thought?</Label>
                      <Textarea
                        id="reframe"
                        placeholder="e.g., Everyone makes mistakes. One error doesn't define my entire competence. I will learn from this."
                        value={thoughtRecord.reframe}
                        onChange={(e) => setThoughtRecord({ ...thoughtRecord, reframe: e.target.value })}
                        className="bg-background border-primary focus-visible:ring-primary"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Try looking for evidence that contradicts the negative thought, or consider what you'd say to a friend in this situation.
                      </p>
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={saveThoughtRecord}
                      disabled={!thoughtRecord.reframe}
                    >
                      Save Reframed Thought <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>
                      Back
                    </Button>
                  </div>
                )}

              </CardContent>
            </Card>

            {savedRecords.length > 0 && (
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-medium flex items-center">
                  <PenLine className="h-5 w-5 mr-2 text-primary" /> Past Reframings
                </h3>
                <div className="grid gap-4">
                  {savedRecords.map((record, i) => (
                    <Card key={i} className="bg-card">
                      <CardHeader className="py-3 px-4 border-b bg-muted/30">
                        <CardDescription className="flex justify-between items-center text-xs">
                          <span>{record.date}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Situation</p>
                          <p className="text-sm">{record.situation}</p>
                        </div>
                        <div className="bg-primary/10 rounded-md p-3 border border-primary/20">
                          <p className="text-xs text-primary uppercase tracking-wider font-semibold mb-1">Reframed Perspective</p>
                          <p className="text-sm font-medium">{record.reframe}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
