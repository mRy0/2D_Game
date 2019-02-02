using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace _2D_Test_Game
{
    public static class DebugInfo
    {
        public static int PlayerX { set; get; }
        public static int PlayerY { set; get; }
        public static int DrawX { set; get; }
        public static int DrawY { set; get; }
        public static int MapX { set; get; }
        public static int MapY { set; get; }
        public static double MsPerDraw { set; get; }
        public static int DrawWidth { set; get; }
        public static int DrawHeight { set; get; }
        public static int PlayerLookDeg { set;get; }


        public static void Log()
        {
            Console.WriteLine("Map X: " + MapX + " Y: " + MapY);
            Console.WriteLine("Draw X: " + DrawX + " Y: " + DrawY);
            Console.WriteLine("Player - X:" + PlayerX + " Y: " + PlayerY);

        }
    }
}
