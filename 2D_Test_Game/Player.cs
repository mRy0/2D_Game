using Bridge.Html5;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace _2D_Test_Game
{
    public class Player
    {
        private const string PlayerGraphics = "img/lard_kopf_transparent.png";
        private const string WeaponGraphics = "img/m4.png";
        private HTMLImageElement _imgPlayer;
        private HTMLImageElement _imgWeapon;

        public static int Width = 32;
        public static int Height = 48;
        public const float Speed = 768;

        public int X { set; get; } = 32;
        public int Y { set; get; } = 32;

        public double DirectionDegrees { set; get; } = 0;


        public Player()
        {

            _imgPlayer = new HTMLImageElement()
            {
                Src = PlayerGraphics
            };
            _imgWeapon = new HTMLImageElement()
            {
                Src = WeaponGraphics
            };
        }

        public void Draw(CanvasRenderingContext2D cnv, int x, int y)
        {
            cnv.DrawImage(_imgPlayer, 0, 0, _imgPlayer.Width, _imgPlayer.Height, x, y,  Width, Height);
            //cnv.StrokeRect(x, y, Width, Height);
            cnv.Save();

            // move to the center of the canvas
            cnv.Translate(x + (Player.Width  / 2), y + (Player.Height / 2));
            //cnv.FillRect(0, 0, 20, 20);
            cnv.Rotate((double)DirectionDegrees / (180 /Math.PI));            
            cnv.DrawImage(_imgWeapon, 0,0, _imgWeapon.Width, _imgWeapon.Height, 0  ,-5, Width *1.5, Height / 2);            
            cnv.Restore();
        }

    }
}
