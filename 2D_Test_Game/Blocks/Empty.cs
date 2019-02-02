using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Bridge.Html5;

namespace _2D_Test_Game.Blocks
{
    public class Empty : Block
    {

        public Empty()
        {
        }

        public override bool Walkalble => false;

        public override void Draw(CanvasRenderingContext2D cnv, int x, int y)
        {
        }
    }
}
