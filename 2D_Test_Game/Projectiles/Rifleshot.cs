using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Bridge.Html5;

namespace _2D_Test_Game.Projectiles
{
    public class Rifleshot : Projectile
    {
        public override double Speed { set; get; } = 3072;

        public override void Draw(CanvasRenderingContext2D context, int x, int y)
        {
            context.FillStyle = "red";

            context.FillRect(x, y, 10, 10);
            //cnv.Save();

            //// move to the center of the canvas
            //cnv.Translate(x + (Player.Width / 2), y + (Player.Height / 2));
            ////cnv.FillRect(0, 0, 20, 20);
            //cnv.Rotate((double)DirectionDegrees / (180 / Math.PI));
            //cnv.DrawImage(_imgWeapon, 0, 0, _imgWeapon.Width, _imgWeapon.Height, 0, -5, Width * 1.5, Height / 2);
            //cnv.Restore();
        }
    }

}
