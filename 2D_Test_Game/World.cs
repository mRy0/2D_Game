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
        }

        public Action Loaded;

        private Blocks.Block[,] _worldBlocks;
        private List<Projectiles.Projectile> _projectiles = new List<Projectiles.Projectile>();
        public Player _player;

        private void LoadMap(string file)
        {
            var json = Bridge.jQuery2.jQuery.GetJSON(file, null, new Action<object>((data) =>
            {
                //int[,] map = Bridge.Html5.JSON.Parse<int[,]>(data);
                int[,] map = (int[,])data;

                var dData = data.ToDynamic();

                int w = 0, h =0;
                foreach (int[] r in dData)
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
                foreach (int[] r in dData)
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


        public void Draw(Bridge.Html5.CanvasRenderingContext2D canvas, int width, int height)
        {            
            //draw black bg
            canvas.FillStyle = "black";
            canvas.FillRect(0, 0, width, height);


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


            //draw projectiles
            foreach(var projectile in _projectiles)
            {
                projectile.Draw(canvas,  drawPosX + projectile.X - mapPosX, drawPosY +  projectile.Y - mapPosY);

            }


            //draw player
            _player.Draw(canvas,(width / 2), (height / 2));
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
            Console.WriteLine("BOOM");
            _projectiles.Add(new Projectiles.Rifleshot()
            {
                Direction = (int) _player.DirectionDegrees,
                X = _player.X + (Player.Width / 2),
                Y = _player.Y + (Player.Height / 2)
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
                    Console.WriteLine("rem proj");
                }
            }
        }
    }
}
