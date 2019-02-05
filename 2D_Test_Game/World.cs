using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace _2D_Test_Game
{
    public class World
    {
        public World(Player player, string file)
        {
            _player = player;
            LoadMap(file);
            _img = new Bridge.Html5.HTMLImageElement()
            {
                Src = "img/backgr.png"
            };
        }

        public Action Loaded;

        private Blocks.Block[,] _worldBlocks;
        private List<Light> _lights = new List<Light>(); 

        private List<Projectiles.Projectile> _projectiles = new List<Projectiles.Projectile>();
        public Player _player;

        private Bridge.Html5.HTMLImageElement _img;

        private void LoadMap(string file)
        {
            var json = Bridge.jQuery2.jQuery.GetJSON(file, null, new Action<object>((data) =>
            {
                //int[,] map = Bridge.Html5.JSON.Parse<int[,]>(data);
                //int[,] map = (int[,])data;
                
                var dData = data.ToDynamic();
                
                int w = 0, h =0;
                foreach (int[] r in dData["blocks"])
                {
                    if(h ==0)
                    {
                        foreach (int bl in r)
                        {
                            w++;
                        }
                    }
                    h++;
                }
                _worldBlocks = new Blocks.Block[h, w];
                    int i = 0, j = 0;
                foreach (int[] r in dData["blocks"])
                {
                    j = 0;
                    foreach (int bl in r)
                    {
                        switch (bl)
                        {
                            case (0):
                                _worldBlocks[i, j] = new Blocks.Empty();
                                break;
                            case (1):
                                _worldBlocks[i, j] = new Blocks.Stone();
                                break;
                            case (2):
                                _worldBlocks[i, j] = new Blocks.Grass();
                                break;
                            case (3):
                                _worldBlocks[i, j] = new Blocks.Dirt();
                                break;
                            default:
                                _worldBlocks[i, j] = new Blocks.Empty();
                                break;
                        }
                        j++;
                    }
                    i++;
                }

                foreach (int[] l in dData["lights"])
                {
                    _lights.Add(new Light()
                    {
                        Type = l[0],
                        X = l[1],
                        Y = l[2]
                    });
                }
                
                Loaded();
            }));
        }
        

        //private void BuildDemoWorld()
        //{
        //    _worldBlocks = new Blocks.Block[64,64];

        //    for (int i = 0; i < _worldBlocks.GetLength(0); i++)
        //    {
        //        for (int j = 0; j < _worldBlocks.GetLength(1); j++)
        //        {
        //            if(i == 0|| j == 0|| i == _worldBlocks.GetLength(0) - 1|| j == _worldBlocks.GetLength(1) - 1)
        //            {
        //                _worldBlocks[i, j] = new Blocks.Stone();
        //            }
        //            else if (i == 2 || j == 2 || i == _worldBlocks.GetLength(0) - 2 || j == _worldBlocks.GetLength(1) - 2)
        //            {
        //                _worldBlocks[i, j] = new Blocks.Dirt();
        //            }
        //            else
        //            {
        //                _worldBlocks[i, j] = new Blocks.Grass();
        //            }
                    
        //        }
        //    }
        //}
        
        private Blocks.Block GetBlockAtXY(int x, int y)
        {
            if (x < 0 || y < 0) return Blocks.Block.EmptyBlock;
            if (x >= _worldBlocks.GetLength(1) * Blocks.Block.BlockSizeX || y >= _worldBlocks.GetLength(0) * Blocks.Block.BlockSizeY) return Blocks.Block.EmptyBlock;
            
            return _worldBlocks[y / Blocks.Block.BlockSizeY, x / Blocks.Block.BlockSizeX];         
        }


        public void Draw(Bridge.Html5.CanvasRenderingContext2D canvas, Bridge.Html5.CanvasRenderingContext2D shadowContext, int width, int height)
        {
            //draw black bg
            //canvas.FillStyle = "black";
            //canvas.FillRect(0, 0, width, height);
            canvas.DrawImage(_img, 0, 0, width, height);

            //draw world
            int mapPosX, mapPosY;
            int drawPosX = 0, drawPosY = 0;

            mapPosX = _player.X - (width / 2);
            mapPosY = _player.Y - (height / 2);

            if(mapPosX < 0)
            {
                drawPosX = -mapPosX;
                mapPosX = 0;
            }
            if(mapPosY < 0)
            {
                drawPosY = -mapPosY;
                mapPosY = 0;
            }


            DebugInfo.DrawX = drawPosX;
            DebugInfo.DrawY = drawPosY;
            DebugInfo.MapX = mapPosX;
            DebugInfo.MapY = mapPosY;
            DebugInfo.PlayerX = _player.X;
            DebugInfo.PlayerY = _player.Y;
            DebugInfo.DrawHeight = height;
            DebugInfo.DrawWidth = width;

            
            

            int tmpDrawX, tmpMapX;
            int tmpMapY = mapPosY;
            int tmpDrawY = drawPosY;

            //go down Y!!
            while (tmpDrawY < height)
            {
                tmpDrawX = drawPosX;
                tmpMapX = mapPosX;

                //go right X!!!
                while(tmpDrawX < width)
                {
                    var block = GetBlockAtXY(tmpMapX, tmpMapY);
                    block.Draw(canvas, tmpDrawX - (mapPosX % Blocks.Block.BlockSizeX), tmpDrawY - (tmpMapY % Blocks.Block.BlockSizeY));


                    tmpMapX += Blocks.Block.BlockSizeX;
                    tmpDrawX += Blocks.Block.BlockSizeX;
                }
                tmpMapY += Blocks.Block.BlockSizeY;
                tmpDrawY += Blocks.Block.BlockSizeY;
            }



            //shadowContext.ClearRect(0, 0, width, height);
            //shadowContext.ClearRect(0, 0, width, height);
            shadowContext.GlobalCompositeOperation = Bridge.Html5.CanvasTypes.CanvasCompositeOperationType.SourceOver;
            shadowContext.FillStyle = "#000";
            shadowContext.FillRect(0, 0, width, height);
            shadowContext.GlobalCompositeOperation = Bridge.Html5.CanvasTypes.CanvasCompositeOperationType.DestinationOut;

            shadowContext.FillStyle = "rgb(0,0,0,0.3)";
            shadowContext.FillRect(0, 0, width, height);


            


            //draw projectiles
            foreach (var projectile in _projectiles)
            {
                projectile.Draw(canvas,  drawPosX + projectile.X - mapPosX, drawPosY +  projectile.Y - mapPosY);

                var lGrd = shadowContext.CreateRadialGradient(drawPosX + projectile.X - mapPosX + 5, drawPosY + projectile.Y - mapPosY + 5, 0, drawPosX + projectile.X - mapPosX + 5, drawPosY + projectile.Y - mapPosY + 5, 50);
                lGrd.AddColorStop(0, "rgba(255,255,255,0.4)");
                lGrd.AddColorStop(1, "rgba(255,255,255,0.0)");
                shadowContext.FillStyle = lGrd;
                shadowContext.GlobalCompositeOperation = Bridge.Html5.CanvasTypes.CanvasCompositeOperationType.DestinationOut;
                shadowContext.FillRect(0, 0, width, height);

                var lGrd2 = shadowContext.CreateRadialGradient(drawPosX + projectile.X - mapPosX + 5, drawPosY + projectile.Y - mapPosY + 5, 0, drawPosX + projectile.X - mapPosX + 5, drawPosY + projectile.Y - mapPosY + 5, 50);
                lGrd2.AddColorStop(0, "rgba(255,0,0,0.5)");
                lGrd2.AddColorStop(1, "rgba(255,0,0,0.0)");
                shadowContext.FillStyle = lGrd2;
                shadowContext.GlobalCompositeOperation = Bridge.Html5.CanvasTypes.CanvasCompositeOperationType.SourceOver;
                shadowContext.FillRect(0, 0, width, height);


            }


            //draw player
            _player.Draw(canvas,(width / 2), (height / 2));



            shadowContext.GlobalCompositeOperation = Bridge.Html5.CanvasTypes.CanvasCompositeOperationType.DestinationOut;

            //create lights
            foreach (var light in _lights)
            {
                int rad = 100;
                if (light.Type == 2)
                {
                    rad = 500;
                }
                var lGrd = shadowContext.CreateRadialGradient(drawPosX - mapPosX + light.X, drawPosY - mapPosY + light.Y, 0, drawPosX - mapPosX + light.X, drawPosY - mapPosY + light.Y, rad);

                lGrd.AddColorStop(0, "rgba(255,255,255," + Math.Round( ((float)light.Brightness / 100), 2)+ ")");
                lGrd.AddColorStop(1, "rgba(255,255,255,0.0)");
                shadowContext.FillStyle = lGrd;
                shadowContext.FillRect(0, 0, width, height);
            }


            canvas.DrawImage(shadowContext.Canvas, 0, 0, width, height);
        }

        public void AnimateLight()
        {
            foreach(var l  in _lights)
            {
                if(l.Type == 3)
                {
                    if(l.Brightness >= 100)
                    {
                        l.BrightDown = true;
                    }
                    else if(l.Brightness <= 0)
                    {
                        l.BrightDown = false;
                    }

                    if(l.BrightDown)
                    {
                        l.Brightness--;
                    }
                    else
                    {
                        l.Brightness++;
                    }
                }
            }
        }
        
        public void MovePlayer(double mvX, double mvY)
        {
            int blocksMvtX = (int)((_player.X + mvX) / Blocks.Block.BlockSizeX);
            int blocksMvtY = (int)((_player.Y + mvY) / Blocks.Block.BlockSizeY);
            
            
            if(mvX != 0 && mvY != 0)
            {
                mvY = mvY / 1.6;
                mvX = mvX / 1.6;
            }


            //move left
            if(mvX < 0)
            {
                int x = (int)(_player.X + mvX + 0.5);
                var blk = GetBlockAtXY(x, _player.Y);
                if (blk.Walkalble) _player.X = x;
            }
            //move right
            else if(mvX > 0)
            {
                int x = (int)(_player.X + mvX + 0.5 );
                var blk = GetBlockAtXY(x + Player.Width, _player.Y);
                if (blk.Walkalble) _player.X = x;
            }

            //move up
            if (mvY < 0)
            {
                int y = (int)(_player.Y + mvY + 0.5);
                var blk = GetBlockAtXY(_player.X, y);
                if (blk.Walkalble) _player.Y = y;
            }
            //move down
            else if (mvY > 0)
            {
                int y = (int)(_player.Y + mvY + 0.5 );
                var blk = GetBlockAtXY(_player.X, y+ Player.Height);
                if (blk.Walkalble) _player.Y = y;
            }





            //get left block

        }

        public void Shoot()
        {
            _projectiles.Add(new Projectiles.Rifleshot()
            {
                Direction = (int) _player.DirectionDegrees,
                X = (int)(_player.X + (Player.Width / 2) + ((Player.Width * 1.5 )* Math.Cos(_player.DirectionDegrees / (180 / Math.PI)))),
                Y = (int)( _player.Y + (Player.Height / 2) + ((Player.Width * 1.5) * Math.Sin(_player.DirectionDegrees / (180 / Math.PI)))),
            });
        }

        public void MoveProjectiles(double ms)
        {
            for (int i = _projectiles.Count -1; i >=0 ; i--)
            {
                var projectile = _projectiles[i];

                projectile.Move(ms);
                if (projectile.X < 0 || projectile.Y < 0 || projectile.X > (_worldBlocks.GetLength(1) * Blocks.Block.BlockSizeX) || projectile.Y > (_worldBlocks.GetLength(0) * Blocks.Block.BlockSizeY))
                { 
                    _projectiles.RemoveAt(i);
                }
            }
        }
    }
}
