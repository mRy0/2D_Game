using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Bridge.Html5;

namespace _2D_Test_Game.Projectiles
{
    public abstract class Projectile
    {
        public int X { set; get; }
        public int Y { set; get; }
        public abstract double Speed { set; get; }
        public int Direction { set; get; }

        public void Move (double ms)
        {


            X += (int)  ((Speed * ( ms / 1000 ) + 0.5) * Math.Cos(Direction / (180 / Math.PI)));
            Y += (int)  ((Speed * ( ms / 1000 ) + 0.5) * Math.Sin(Direction / (180 / Math.PI)));

            //X += (int)((Speed * ( 1000 /ms )) * Math.Cos(Direction) + 0.5);
            //Y += (int)((Speed * ( 1000/ ms )) * Math.Sin(Direction) + 0.5);

        }

        public abstract void Draw(CanvasRenderingContext2D context, int startX, int startY);
    }
}
