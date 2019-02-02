using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Bridge.Html5;

namespace _2D_Test_Game.Blocks
{
    public abstract class Block
    {
        public static int BlockSizeX =32;
        public static int BlockSizeY = 32;

        public abstract bool Walkalble { get; }
        public abstract void Draw(CanvasRenderingContext2D cnv, int x, int y);

        public static Block EmptyBlock => new Empty();  
    }
}
