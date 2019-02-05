using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace _2D_Test_Game
{
    public class Light
    {
        public int X { set; get; }
        public int Y { set; get; }
        public int Type { set; get; }
        public int Brightness { set; get; }
        public bool BrightDown { set; get; }
        public Light()
        {
            X = 0;
            Y = 0;
            Type = 0;
            Brightness = 85;
            BrightDown = false;
        }
    }
}
