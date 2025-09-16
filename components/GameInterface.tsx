'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Clock, 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  Home,
  Trophy,
  Zap,
  Target
} from 'lucide-react';
import { mathQuestions } from '@/lib/mathQuestions';

interface Player {
  id: string;
  name: string;
  highScore: number;
  gamesPlayed: number;
  totalPoints: number;
  averageScore: number;
  lastPlayed: string;
}

interface GameInterfaceProps {
  player: Player;
  onGameComplete: (score: number) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  difficulty: string;
  hints: string[];
}

export default function GameInterface({ player, onGameComplete }: GameInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [towersBuilt, setTowersBuilt] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Select 10 random questions for this game
    const shuffled = [...mathQuestions].sort(() => 0.5 - Math.random());
    setGameQuestions(shuffled.slice(0, 10));
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !showExplanation) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showExplanation) {
      handleAnswer(null); // Time's up
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, gameOver, showExplanation]);

  const currentQuestion = gameQuestions[currentQuestionIndex];

  const handleAnswer = (answerIndex: number | null) => {
    if (showExplanation || gameOver) return;

    const correct = answerIndex === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    if (correct) {
      // Calculate score with time bonus
      const timeBonus = Math.floor(timeLeft * 2);
      const hintPenalty = hintsUsed * 50;
      const questionScore = Math.max(100 + timeBonus - hintPenalty, 50);
      setScore(score + questionScore);
      setTowersBuilt(towersBuilt + 1);
    } else {
      setLives(lives - 1);
      if (lives - 1 <= 0) {
        setGameOver(true);
      }
    }
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    setShowHint(false);
    setCurrentHint(0);
    setTimeLeft(60);

    if (currentQuestionIndex + 1 >= gameQuestions.length || lives <= 0) {
      setGameOver(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleHint = () => {
    if (hintsUsed >= 2 || showExplanation) return;
    
    setHintsUsed(hintsUsed + 1);
    setShowHint(true);
    setCurrentHint(hintsUsed);
  };

  const handleGameEnd = () => {
    onGameComplete(score);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4 bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl text-white mb-4">
              {lives <= 0 ? 'Game Over!' : 'Tower Complete!'}
            </CardTitle>
            <div className="text-6xl mb-4">
              {lives <= 0 ? '💥' : '🏆'}
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">{score}</div>
                <div className="text-yellow-100">Final Score</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">{towersBuilt}</div>
                <div className="text-purple-100">Towers Built</div>
              </div>
            </div>
            
            <div className="space-y-2 text-blue-200">
              <div>Questions Answered: {currentQuestionIndex + (showExplanation ? 1 : 0)}</div>
              <div>Hints Used: {hintsUsed}/2</div>
              {score > player.highScore && (
                <div className="text-yellow-400 font-bold text-xl">🎉 New High Score! 🎉</div>
              )}
            </div>

            <Button 
              onClick={handleGameEnd}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Game Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">Math Tower</h1>
            <Badge variant="secondary" className="bg-purple-600 text-white">
              Question {currentQuestionIndex + 1}/10
            </Badge>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Lives */}
            <div className="flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 ${
                    i < lives ? 'text-red-500 fill-red-500' : 'text-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Score */}
            <div className="bg-yellow-500 rounded-lg px-4 py-2">
              <div className="text-white font-bold text-xl">{score}</div>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
              <Clock className="w-5 h-5" />
              <span className="text-xl font-mono">{timeLeft}s</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tower Visualization */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-center">Your Tower</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Tower floors */}
                  {[...Array(10)].reverse().map((_, i) => {
                    const floorNumber = 10 - i;
                    const isBuilt = floorNumber <= towersBuilt;
                    const isCurrent = floorNumber === towersBuilt + 1;
                    
                    return (
                      <div
                        key={floorNumber}
                        className={`h-8 rounded transition-all duration-500 flex items-center justify-center text-sm font-bold ${
                          isBuilt 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                            : isCurrent
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white animate-pulse'
                            : 'bg-gray-300/20 text-gray-400'
                        }`}
                      >
                        Floor {floorNumber}
                      </div>
                    );
                  })}
                  
                  {/* Base */}
                  <div className="h-6 bg-gradient-to-r from-stone-600 to-stone-700 rounded text-white text-center text-xs flex items-center justify-center">
                    Foundation
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <div className="text-white text-lg font-bold">{towersBuilt}/10 Floors</div>
                  <Progress value={(towersBuilt / 10) * 100} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="border-purple-400 text-purple-200">
                      {currentQuestion.topic} - {currentQuestion.difficulty}
                    </Badge>
                    <Button
                      onClick={handleHint}
                      disabled={hintsUsed >= 2 || showExplanation}
                      variant="outline"
                      size="sm"
                      className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      Hint ({2 - hintsUsed} left)
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-white text-lg leading-relaxed">
                  {currentQuestion.question}
                </div>

                {showHint && (
                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
                    <div className="text-yellow-200 font-semibold mb-2">
                      💡 Hint {currentHint + 1}:
                    </div>
                    <div className="text-yellow-100">
                      {currentQuestion.hints[currentHint]}
                    </div>
                  </div>
                )}

                <div className="grid gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showExplanation}
                      variant="outline"
                      className={`text-left justify-start p-4 h-auto border-white/20 text-black bg-white/90 hover:bg-white hover:text-black ${
                        showExplanation
                          ? index === currentQuestion.correctAnswer
                            ? 'bg-green-500/90 border-green-400 text-white'
                            : index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer
                            ? 'bg-red-500/90 border-red-400 text-white'
                            : ''
                          : ''
                      }`}
                    >
                      <span className="font-bold mr-3 text-black">{String.fromCharCode(65 + index)}.</span>
                      {option}
                      {showExplanation && index === currentQuestion.correctAnswer && (
                        <CheckCircle className="w-5 h-5 ml-auto text-green-400" />
                      )}
                      {showExplanation && index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer && (
                        <XCircle className="w-5 h-5 ml-auto text-red-400" />
                      )}
                    </Button>
                  ))}
                </div>

                {showExplanation && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${
                      isCorrect 
                        ? 'bg-green-500/20 border-green-400/30' 
                        : 'bg-red-500/20 border-red-400/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {isCorrect ? (
                          <><CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-green-200 font-semibold">Correct! +{Math.max(100 + Math.floor(timeLeft * 2) - hintsUsed * 50, 50)} points</span></>
                        ) : (
                          <><XCircle className="w-5 h-5 text-red-400" />
                          <span className="text-red-200 font-semibold">Incorrect! You lost a life.</span></>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                      <div className="text-blue-200 font-semibold mb-2">📚 Explanation:</div>
                      <div className="text-blue-100 leading-relaxed">
                        {currentQuestion.explanation}
                      </div>
                    </div>

                    <Button
                      onClick={handleNextQuestion}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                      {currentQuestionIndex + 1 >= gameQuestions.length || lives <= 0 ? 'Finish Game' : 'Next Question'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}