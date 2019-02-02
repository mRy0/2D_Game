using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Bridge.Html5;

namespace _2D_Test_Game
{
    public class Game
    {
        public static void Main()
        {
            var cnv = new HTMLCanvasElement();
            Document.Body.AppendChild(cnv);
            var game = new Game(cnv);
            Window.OnResize += (ev) =>
            {
                game.Resize();
            };
            Window.OnKeyDown += (KeyboardEvent ev) =>
            {
                game.PressKey(ev.KeyCode);
            };
            Window.OnKeyUp += (KeyboardEvent ev) =>
            {
                game.ReleaseKey(ev.KeyCode);
            };
            Window.OnMouseMove += (MouseEvent ev) =>
            {
                game.SetMousePos(ev.ClientX, ev.ClientY);
            };
            Window.OnMouseDown += (MouseEvent ev) =>
            {
                if ((ev.Buttons & (1 << 0)) == 1)
                {
                    game.PressKey(-1);
                }
            };
            Window.OnMouseUp += (MouseEvent ev) =>
            {
                if ((ev.Buttons & (1 << 0)) == 0)
                {
                    game.ReleaseKey(-1);
                }
            };
        }
        
        private HTMLCanvasElement _mainCanvas;
        private CanvasRenderingContext2D _mainCanvasRenderer;

        private DateTime _lastDraw;

        private World _world;
        private Player _player;

        private List<int> _keys = new List<int>();
        private int _mouseX;
        private int _mouseY;

        
        public Game(HTMLCanvasElement canvas)
        {
            _mainCanvas = canvas;
            _mainCanvasRenderer = _mainCanvas.GetContext(CanvasTypes.CanvasContext2DType.CanvasRenderingContext2D);
            Resize();

            _player = new Player();

            _lastDraw = DateTime.Now;

            _world = new World(_player, "map1.json");
            _world.Loaded += () => {
                Window.RequestAnimationFrame(GameFrame);

            };

        }

        public void PressKey(int keyCode)
        {
            if (!_keys.Contains(keyCode))
            {
                _keys.Add(keyCode);
            }
        }
        public void ReleaseKey(int keyCode)
        {
            _keys.Remove(keyCode);
        }

        public void SetMousePos(int x, int y)
        {
            _mouseX = x ;
            _mouseY = y;
        }


        public void Resize()
        {
            _mainCanvas.Width = Window.Document.Body.ClientWidth;
            _mainCanvas.Height = Window.Document.Body.ClientHeight - 8;
        }

        private void GameFrame()
        {
            HandleMovement();

            _world.MoveProjectiles((DateTime.Now - _lastDraw).TotalMilliseconds );



            _world.Draw(_mainCanvasRenderer, _mainCanvas.Width, _mainCanvas.Height);

            


            DebugInfo.MsPerDraw =  ((DateTime.Now - _lastDraw).TotalMilliseconds);
            _lastDraw = DateTime.Now;


            DrawDebugInfo();

            //Window.RequestAnimationFrame(GameFrame);
            Window.SetTimeout(GameFrame, 0);

        }

        private void DrawDebugInfo()
        {
            _mainCanvasRenderer.FillStyle = "white";
            _mainCanvasRenderer.Font = "16px Arial";

            _mainCanvasRenderer.FillText("FPS: " + ( (int)(1000 / DebugInfo.MsPerDraw) ).ToString(), 0, 18);
            _mainCanvasRenderer.FillText("Player X: " + DebugInfo.PlayerX + " Y: " + DebugInfo.PlayerY + " V: " + DebugInfo.PlayerLookDeg, 0, 36);
            _mainCanvasRenderer.FillText("Map X: " + DebugInfo.MapX + " Y: " + DebugInfo.MapY, 0, 54);
            _mainCanvasRenderer.FillText("Draw X: " + DebugInfo.DrawX + " Y: " + DebugInfo.DrawY, 0 , 72);
            _mainCanvasRenderer.FillText("Screen W: " +DebugInfo.DrawWidth + " H: " + DebugInfo.DrawHeight, 0, 90);
            _mainCanvasRenderer.FillText("Mouse X: " + _mouseX + " Y: " + _mouseY, 0, 108);

        }


        private DateTime _nextShoot = DateTime.Now;
        private void HandleMovement()
        {


            int centerY = (_mainCanvas.Height / 2) + (Player.Height / 2);
            int centerX = (_mainCanvas.Width / 2) + (Player.Width / 2);


            var foo = Math.Atan2(centerY - _mouseY, centerX - _mouseX);


            foo = foo * 180 / Math.PI;
            foo += 180;

            _player.DirectionDegrees = foo;
            DebugInfo.PlayerLookDeg = (int)_player.DirectionDegrees;

            double mvnt = ((DateTime.Now - _lastDraw).TotalMilliseconds / 1000);

            double mvmntX= 0 , mvmntY = 0;


            foreach (var key in _keys)
            {
                //w
                if (key == 87)
                {
                    mvmntY -= (Player.Speed * mvnt);
                }
                //a
                else if (key == 65)
                {
                    mvmntX -= (Player.Speed * mvnt);
                }
                //s
                else if (key == 83)
                {
                    mvmntY += (Player.Speed * mvnt);
                }
                //d
                else if (key == 68)
                {
                    mvmntX += (Player.Speed * mvnt);
                }
                else if(key == -1)
                {
                    if(_nextShoot <= DateTime.Now)
                    {
                        _world.Shoot();
                        _nextShoot = DateTime.Now.AddMilliseconds(100);
                    }
                }
            }
            _world.MovePlayer(mvmntX, mvmntY);
        }
        


    }
}
