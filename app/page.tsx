'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Play, Users, Target, Clock, BookOpen } from 'lucide-react';
import GameInterface from '@/components/GameInterface';

interface Player {
  id: string;
  name: string;
  highScore: number;
  gamesPlayed: number;
  totalPoints: number;
  averageScore: number;
  lastPlayed: string;
}

export default function Home() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    // Load current player
    const savedPlayer = localStorage.getItem('mathTowerPlayer');
    if (savedPlayer) {
      setCurrentPlayer(JSON.parse(savedPlayer));
    }

    // Load and update leaderboard
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    const players = JSON.parse(localStorage.getItem('mathTowerPlayers') || '[]');
    const sortedPlayers = players
      .sort((a: Player, b: Player) => b.highScore - a.highScore)
      .slice(0, 10);
    setLeaderboard(sortedPlayers);
  };

  const handleAuth = () => {
    if (!playerName.trim()) return;

    const players = JSON.parse(localStorage.getItem('mathTowerPlayers') || '[]');
    let player = players.find((p: Player) => p.name === playerName);

    if (!player) {
      if (!isLogin) {
        // Create new player
        player = {
          id: Date.now().toString(),
          name: playerName,
          highScore: 0,
          gamesPlayed: 0,
          totalPoints: 0,
          averageScore: 0,
          lastPlayed: new Date().toISOString()
        };
        players.push(player);
        localStorage.setItem('mathTowerPlayers', JSON.stringify(players));
      } else {
        alert('Player not found. Please register first.');
        return;
      }
    }

    localStorage.setItem('mathTowerPlayer', JSON.stringify(player));
    setCurrentPlayer(player);
    loadLeaderboard();
  };

  const handleGameComplete = (score: number) => {
    if (!currentPlayer) return;

    const players = JSON.parse(localStorage.getItem('mathTowerPlayers') || '[]');
    const updatedPlayer = {
      ...currentPlayer,
      highScore: Math.max(currentPlayer.highScore, score),
      gamesPlayed: currentPlayer.gamesPlayed + 1,
      totalPoints: currentPlayer.totalPoints + score,
      averageScore: Math.round((currentPlayer.totalPoints + score) / (currentPlayer.gamesPlayed + 1)),
      lastPlayed: new Date().toISOString()
    };

    const playerIndex = players.findIndex((p: Player) => p.id === currentPlayer.id);
    if (playerIndex !== -1) {
      players[playerIndex] = updatedPlayer;
    }

    localStorage.setItem('mathTowerPlayers', JSON.stringify(players));
    localStorage.setItem('mathTowerPlayer', JSON.stringify(updatedPlayer));
    setCurrentPlayer(updatedPlayer);
    setGameStarted(false);
    loadLeaderboard();
  };

  if (gameStarted && currentPlayer) {
    return <GameInterface player={currentPlayer} onGameComplete={handleGameComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Math Tower Challenge
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Build your mathematical tower by solving 9th grade problems. Climb higher, score more!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Authentication/Player Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  {currentPlayer ? (
                    <div className="space-y-2">
                      <Users className="w-8 h-8 mx-auto text-yellow-400" />
                      <div>Welcome back, {currentPlayer.name}!</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <BookOpen className="w-8 h-8 mx-auto text-blue-400" />
                      <div>{isLogin ? 'Player Login' : 'New Player Registration'}</div>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentPlayer ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-3">
                        <div className="text-2xl font-bold text-white">{currentPlayer.highScore}</div>
                        <div className="text-sm text-yellow-100">High Score</div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3">
                        <div className="text-2xl font-bold text-white">{currentPlayer.gamesPlayed}</div>
                        <div className="text-sm text-purple-100">Games Played</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg text-blue-200">Average Score: {currentPlayer.averageScore}</div>
                      <div className="text-sm text-blue-300">Total Points: {currentPlayer.totalPoints}</div>
                    </div>
                    <Button 
                      onClick={() => setGameStarted(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 text-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start New Game
                    </Button>
                    <Button 
                      onClick={() => {
                        localStorage.removeItem('mathTowerPlayer');
                        setCurrentPlayer(null);
                      }}
                      variant="default"
                      className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white"
                    >
                      Switch Player
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="playerName" className="text-white">Player Name</Label>
                      <Input
                        id="playerName"
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your name"
                        className="mt-2 bg-white/10 border-white/20 text-white placeholder-white/50"
                        onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                      />
                    </div>
                    <Button 
                      onClick={handleAuth}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {isLogin ? 'Login' : 'Register'}
                    </Button>
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="w-full text-blue-200 hover:text-white underline"
                    >
                      {isLogin ? 'Need to register?' : 'Already have an account?'}
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Stats */}
            <Card className="mt-6 bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-center flex items-center justify-center gap-2">
                  <Target className="w-5 h-5" />
                  Game Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-blue-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span>Timed challenges with bonus points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span>2 hints per game (point penalty)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span>3 lives per game</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-yellow-400" />
                    <span>Detailed explanations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Leaderboard */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-center flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Live Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((player, index) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                          index === 0 
                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                            : index === 1
                            ? 'bg-gradient-to-r from-gray-300/20 to-gray-400/20 border border-gray-400/30'
                            : index === 2
                            ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-600/30'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-amber-600 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-white font-semibold">{player.name}</div>
                            <div className="text-blue-200 text-sm">
                              {player.gamesPlayed} games • Avg: {player.averageScore}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-400">{player.highScore}</div>
                          <div className="text-blue-300 text-sm">High Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
                    <p className="text-blue-200 text-lg">No players yet!</p>
                    <p className="text-blue-300">Be the first to climb the Math Tower</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Math Topics Covered */}
            <Card className="mt-6 bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-center">Topics Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Number Systems',
                    'Polynomials',
                    'Coordinate Geometry',
                    'Linear Equations',
                    'Triangles',
                    'Quadrilaterals',
                    'Circles',
                    'Statistics',
                    'Probability'
                  ].map((topic) => (
                    <div key={topic} className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-2 text-center">
                      <span className="text-white text-sm">{topic}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}