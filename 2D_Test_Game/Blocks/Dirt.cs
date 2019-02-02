using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Bridge.Html5;

namespace _2D_Test_Game.Blocks
{
    public class Dirt : Block
    {
        private const string File = "img/DirtBlock.png";
        private HTMLImageElement _img;

        public Dirt()
        {
            _img = new HTMLImageElement()
            {
                Src = File
            };
        }

        public override bool Walkalble => true;

        public override void Draw(CanvasRenderingContext2D cnv, int x, int y)
        {
            cnv.DrawImage(_img, 0,0, BlockSizeX, BlockSizeY, x,y, BlockSizeX, BlockSizeY);
        }
    }
}
