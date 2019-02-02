/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2019
 * @compiler Bridge.NET 17.6.0
 */
Bridge.assembly("2D_Test_Game", function ($asm, globals) {
    "use strict";

    Bridge.define("_2D_Test_Game.Blocks.Block", {
        statics: {
            fields: {
                BlockSizeX: 0,
                BlockSizeY: 0
            },
            props: {
                EmptyBlock: {
                    get: function () {
                        return new _2D_Test_Game.Blocks.Empty();
                    }
                }
            },
            ctors: {
                init: function () {
                    this.BlockSizeX = 32;
                    this.BlockSizeY = 32;
                }
            }
        }
    });

    Bridge.define("_2D_Test_Game.DebugInfo", {
        statics: {
            fields: {
                PlayerX: 0,
                PlayerY: 0,
                DrawX: 0,
                DrawY: 0,
                MapX: 0,
                MapY: 0,
                MsPerDraw: 0,
                DrawWidth: 0,
                DrawHeight: 0,
                PlayerLookDeg: 0
            },
            methods: {
                Log: function () {
                    System.Console.WriteLine("Map X: " + _2D_Test_Game.DebugInfo.MapX + " Y: " + _2D_Test_Game.DebugInfo.MapY);
                    System.Console.WriteLine("Draw X: " + _2D_Test_Game.DebugInfo.DrawX + " Y: " + _2D_Test_Game.DebugInfo.DrawY);
                    System.Console.WriteLine("Player - X:" + _2D_Test_Game.DebugInfo.PlayerX + " Y: " + _2D_Test_Game.DebugInfo.PlayerY);

                }
            }
        }
    });

    Bridge.define("_2D_Test_Game.Game", {
        main: function Main () {
            var cnv = document.createElement("canvas");
            document.body.appendChild(cnv);
            var game = new _2D_Test_Game.Game(cnv);
            window.onresize = Bridge.fn.combine(window.onresize, function (ev) {
                game.Resize();
            });
            window.onkeydown = Bridge.fn.combine(window.onkeydown, function (ev) {
                game.PressKey(ev.keyCode);
            });
            window.onkeyup = Bridge.fn.combine(window.onkeyup, function (ev) {
                game.ReleaseKey(ev.keyCode);
            });
            window.onmousemove = Bridge.fn.combine(window.onmousemove, function (ev) {
                game.SetMousePos(ev.clientX, ev.clientY);
            });
            window.onmousedown = Bridge.fn.combine(window.onmousedown, function (ev) {
                if ((ev.buttons & (1)) === 1) {
                    game.PressKey(-1);
                }
            });
            window.onmouseup = Bridge.fn.combine(window.onmouseup, function (ev) {
                if ((ev.buttons & (1)) === 0) {
                    game.ReleaseKey(-1);
                }
            });
        },
        fields: {
            _mainCanvas: null,
            _mainCanvasRenderer: null,
            _lastDraw: null,
            _world: null,
            _player: null,
            _keys: null,
            _mouseX: 0,
            _mouseY: 0,
            _nextShoot: null
        },
        ctors: {
            init: function () {
                this._lastDraw = System.DateTime.getDefaultValue();
                this._nextShoot = System.DateTime.getDefaultValue();
                this._keys = new (System.Collections.Generic.List$1(System.Int32)).ctor();
                this._nextShoot = System.DateTime.getNow();
            },
            ctor: function (canvas) {
                this.$initialize();
                this._mainCanvas = canvas;
                this._mainCanvasRenderer = this._mainCanvas.getContext("2d");
                this.Resize();

                this._player = new _2D_Test_Game.Player();

                this._lastDraw = System.DateTime.getNow();

                this._world = new _2D_Test_Game.World(this._player, "map1.json");
                this._world.Loaded = Bridge.fn.combine(this._world.Loaded, Bridge.fn.bind(this, function () {
                    window.requestAnimationFrame(Bridge.fn.cacheBind(this, this.GameFrame));

                }));

            }
        },
        methods: {
            PressKey: function (keyCode) {
                if (!this._keys.contains(keyCode)) {
                    this._keys.add(keyCode);
                }
            },
            ReleaseKey: function (keyCode) {
                this._keys.remove(keyCode);
            },
            SetMousePos: function (x, y) {
                this._mouseX = x;
                this._mouseY = y;
            },
            Resize: function () {
                this._mainCanvas.width = window.document.body.clientWidth;
                this._mainCanvas.height = (window.document.body.clientHeight - 8) | 0;
            },
            GameFrame: function () {
                this.HandleMovement();

                this._world.MoveProjectiles((System.DateTime.subdd(System.DateTime.getNow(), this._lastDraw)).getTotalMilliseconds());



                this._world.Draw(this._mainCanvasRenderer, this._mainCanvas.width, this._mainCanvas.height);




                _2D_Test_Game.DebugInfo.MsPerDraw = ((System.DateTime.subdd(System.DateTime.getNow(), this._lastDraw)).getTotalMilliseconds());
                this._lastDraw = System.DateTime.getNow();


                this.DrawDebugInfo();

                window.setTimeout(Bridge.fn.cacheBind(this, this.GameFrame), 0);

            },
            DrawDebugInfo: function () {
                this._mainCanvasRenderer.fillStyle = "white";
                this._mainCanvasRenderer.font = "16px Arial";

                this._mainCanvasRenderer.fillText("FPS: " + (Bridge.toString((Bridge.Int.clip32(1000 / _2D_Test_Game.DebugInfo.MsPerDraw))) || ""), 0, 18);
                this._mainCanvasRenderer.fillText("Player X: " + _2D_Test_Game.DebugInfo.PlayerX + " Y: " + _2D_Test_Game.DebugInfo.PlayerY + " V: " + _2D_Test_Game.DebugInfo.PlayerLookDeg, 0, 36);
                this._mainCanvasRenderer.fillText("Map X: " + _2D_Test_Game.DebugInfo.MapX + " Y: " + _2D_Test_Game.DebugInfo.MapY, 0, 54);
                this._mainCanvasRenderer.fillText("Draw X: " + _2D_Test_Game.DebugInfo.DrawX + " Y: " + _2D_Test_Game.DebugInfo.DrawY, 0, 72);
                this._mainCanvasRenderer.fillText("Screen W: " + _2D_Test_Game.DebugInfo.DrawWidth + " H: " + _2D_Test_Game.DebugInfo.DrawHeight, 0, 90);
                this._mainCanvasRenderer.fillText("Mouse X: " + this._mouseX + " Y: " + this._mouseY, 0, 108);

            },
            HandleMovement: function () {
                var $t;


                var centerY = ((((Bridge.Int.div(this._mainCanvas.height, 2)) | 0)) + (((Bridge.Int.div(_2D_Test_Game.Player.Height, 2)) | 0))) | 0;
                var centerX = ((((Bridge.Int.div(this._mainCanvas.width, 2)) | 0)) + (((Bridge.Int.div(_2D_Test_Game.Player.Width, 2)) | 0))) | 0;


                var foo = Math.atan2(((centerY - this._mouseY) | 0), ((centerX - this._mouseX) | 0));


                foo = foo * 180 / Math.PI;
                foo += 180;

                this._player.DirectionDegrees = foo;
                _2D_Test_Game.DebugInfo.PlayerLookDeg = Bridge.Int.clip32(this._player.DirectionDegrees);

                var mvnt = ((System.DateTime.subdd(System.DateTime.getNow(), this._lastDraw)).getTotalMilliseconds() / 1000);

                var mvmntX = 0, mvmntY = 0;


                $t = Bridge.getEnumerator(this._keys);
                try {
                    while ($t.moveNext()) {
                        var key = $t.Current;
                        if (key === 87) {
                            mvmntY -= (_2D_Test_Game.Player.Speed * mvnt);
                        } else if (key === 65) {
                            mvmntX -= (_2D_Test_Game.Player.Speed * mvnt);
                        } else if (key === 83) {
                            mvmntY += (_2D_Test_Game.Player.Speed * mvnt);
                        } else if (key === 68) {
                            mvmntX += (_2D_Test_Game.Player.Speed * mvnt);
                        } else if (key === -1) {
                            if (System.DateTime.lte(this._nextShoot, System.DateTime.getNow())) {
                                this._world.Shoot();
                                this._nextShoot = System.DateTime.addMilliseconds(System.DateTime.getNow(), 100);
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                this._world.MovePlayer(mvmntX, mvmntY);
            }
        }
    });

    Bridge.define("_2D_Test_Game.Player", {
        statics: {
            fields: {
                PlayerGraphics: null,
                WeaponGraphics: null,
                Width: 0,
                Height: 0,
                Speed: 0
            },
            ctors: {
                init: function () {
                    this.PlayerGraphics = "img/lard_kopf_transparent.png";
                    this.WeaponGraphics = "img/m4.png";
                    this.Width = 32;
                    this.Height = 48;
                    this.Speed = 768;
                }
            }
        },
        fields: {
            _imgPlayer: null,
            _imgWeapon: null,
            X: 0,
            Y: 0,
            DirectionDegrees: 0
        },
        ctors: {
            init: function () {
                this.X = 32;
                this.Y = 32;
                this.DirectionDegrees = 0;
            },
            ctor: function () {
                var $t;
                this.$initialize();

                this._imgPlayer = ($t = new Image(), $t.src = _2D_Test_Game.Player.PlayerGraphics, $t);
                this._imgWeapon = ($t = new Image(), $t.src = _2D_Test_Game.Player.WeaponGraphics, $t);
            }
        },
        methods: {
            Draw: function (cnv, x, y) {
                cnv.drawImage(this._imgPlayer, 0, 0, this._imgPlayer.width, this._imgPlayer.height, x, y, _2D_Test_Game.Player.Width, _2D_Test_Game.Player.Height);
                cnv.save();

                cnv.translate(((x + (((Bridge.Int.div(_2D_Test_Game.Player.Width, 2)) | 0))) | 0), ((y + (((Bridge.Int.div(_2D_Test_Game.Player.Height, 2)) | 0))) | 0));
                cnv.rotate(this.DirectionDegrees / (57.295779513082323));
                cnv.drawImage(this._imgWeapon, 0, 0, this._imgWeapon.width, this._imgWeapon.height, 0, -5, _2D_Test_Game.Player.Width * 1.5, ((Bridge.Int.div(_2D_Test_Game.Player.Height, 2)) | 0));
                cnv.restore();
            }
        }
    });

    Bridge.define("_2D_Test_Game.Projectiles.Projectile", {
        fields: {
            X: 0,
            Y: 0,
            Direction: 0
        },
        methods: {
            Move: function (ms) {


                this.X = (this.X + (Bridge.Int.clip32((this.Speed * (ms / 1000) + 0.5) * Math.cos(this.Direction / (57.295779513082323))))) | 0;
                this.Y = (this.Y + (Bridge.Int.clip32((this.Speed * (ms / 1000) + 0.5) * Math.sin(this.Direction / (57.295779513082323))))) | 0;


            }
        }
    });

    Bridge.define("_2D_Test_Game.World", {
        fields: {
            Loaded: null,
            _worldBlocks: null,
            _projectiles: null,
            _player: null
        },
        ctors: {
            init: function () {
                this._projectiles = new (System.Collections.Generic.List$1(_2D_Test_Game.Projectiles.Projectile)).ctor();
            },
            ctor: function (player, file) {
                this.$initialize();
                this._player = player;
                this.LoadMap(file);
            }
        },
        methods: {
            LoadMap: function (file) {
                var json = $.getJSON(file, null, Bridge.fn.bind(this, function (data) {
                    var $t, $t1, $t2, $t3;
                    var map = Bridge.cast(data, System.Array.type(System.Int32, 2));

                    var dData = data;

                    var w = 0, h = 0;
                    $t = Bridge.getEnumerator(dData);
                    try {
                        while ($t.moveNext()) {
                            var r = Bridge.cast($t.Current, System.Array.type(System.Int32));
                            if (h === 0) {
                                $t1 = Bridge.getEnumerator(r);
                                try {
                                    while ($t1.moveNext()) {
                                        var bl = $t1.Current;
                                        w = (w + 1) | 0;
                                    }
                                } finally {
                                    if (Bridge.is($t1, System.IDisposable)) {
                                        $t1.System$IDisposable$Dispose();
                                    }
                                }
                            }
                            h = (h + 1) | 0;
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$Dispose();
                        }
                    }
                    this._worldBlocks = System.Array.create(null, null, _2D_Test_Game.Blocks.Block, h, w);
                    var i = 0, j = 0;
                    $t2 = Bridge.getEnumerator(dData);
                    try {
                        while ($t2.moveNext()) {
                            var r1 = Bridge.cast($t2.Current, System.Array.type(System.Int32));
                            j = 0;
                            $t3 = Bridge.getEnumerator(r1);
                            try {
                                while ($t3.moveNext()) {
                                    var bl1 = $t3.Current;
                                    switch (bl1) {
                                        case (0): 
                                            this._worldBlocks.set([i, j], new _2D_Test_Game.Blocks.Empty());
                                            break;
                                        case (1): 
                                            this._worldBlocks.set([i, j], new _2D_Test_Game.Blocks.Stone());
                                            break;
                                        case (2): 
                                            this._worldBlocks.set([i, j], new _2D_Test_Game.Blocks.Grass());
                                            break;
                                        case (3): 
                                            this._worldBlocks.set([i, j], new _2D_Test_Game.Blocks.Dirt());
                                            break;
                                        default: 
                                            this._worldBlocks.set([i, j], new _2D_Test_Game.Blocks.Empty());
                                            break;
                                    }
                                    j = (j + 1) | 0;
                                }
                            } finally {
                                if (Bridge.is($t3, System.IDisposable)) {
                                    $t3.System$IDisposable$Dispose();
                                }
                            }
                            i = (i + 1) | 0;
                        }
                    } finally {
                        if (Bridge.is($t2, System.IDisposable)) {
                            $t2.System$IDisposable$Dispose();
                        }
                    }

                    this.Loaded();
                }));
            },
            GetBlockAtXY: function (x, y) {
                if (x < 0 || y < 0) {
                    return _2D_Test_Game.Blocks.Block.EmptyBlock;
                }
                if (x >= Bridge.Int.mul(System.Array.getLength(this._worldBlocks, 1), _2D_Test_Game.Blocks.Block.BlockSizeX) || y >= Bridge.Int.mul(System.Array.getLength(this._worldBlocks, 0), _2D_Test_Game.Blocks.Block.BlockSizeY)) {
                    return _2D_Test_Game.Blocks.Block.EmptyBlock;
                }

                return this._worldBlocks.get([((Bridge.Int.div(y, _2D_Test_Game.Blocks.Block.BlockSizeY)) | 0), ((Bridge.Int.div(x, _2D_Test_Game.Blocks.Block.BlockSizeX)) | 0)]);
            },
            Draw: function (canvas, width, height) {
                var $t;
                canvas.fillStyle = "black";
                canvas.fillRect(0, 0, width, height);


                var mapPosX, mapPosY;
                var drawPosX = 0, drawPosY = 0;

                mapPosX = (this._player.X - (((Bridge.Int.div(width, 2)) | 0))) | 0;
                mapPosY = (this._player.Y - (((Bridge.Int.div(height, 2)) | 0))) | 0;

                if (mapPosX < 0) {
                    drawPosX = (-mapPosX) | 0;
                    mapPosX = 0;
                }
                if (mapPosY < 0) {
                    drawPosY = (-mapPosY) | 0;
                    mapPosY = 0;
                }


                _2D_Test_Game.DebugInfo.DrawX = drawPosX;
                _2D_Test_Game.DebugInfo.DrawY = drawPosY;
                _2D_Test_Game.DebugInfo.MapX = mapPosX;
                _2D_Test_Game.DebugInfo.MapY = mapPosY;
                _2D_Test_Game.DebugInfo.PlayerX = this._player.X;
                _2D_Test_Game.DebugInfo.PlayerY = this._player.Y;
                _2D_Test_Game.DebugInfo.DrawHeight = height;
                _2D_Test_Game.DebugInfo.DrawWidth = width;



                var tmpDrawX, tmpMapX;
                var tmpMapY = mapPosY;
                var tmpDrawY = drawPosY;

                while (tmpDrawY < height) {
                    tmpDrawX = drawPosX;
                    tmpMapX = mapPosX;

                    while (tmpDrawX < width) {
                        var block = this.GetBlockAtXY(tmpMapX, tmpMapY);
                        block.Draw(canvas, ((tmpDrawX - (mapPosX % _2D_Test_Game.Blocks.Block.BlockSizeX)) | 0), ((tmpDrawY - (tmpMapY % _2D_Test_Game.Blocks.Block.BlockSizeY)) | 0));


                        tmpMapX = (tmpMapX + _2D_Test_Game.Blocks.Block.BlockSizeX) | 0;
                        tmpDrawX = (tmpDrawX + _2D_Test_Game.Blocks.Block.BlockSizeX) | 0;
                    }
                    tmpMapY = (tmpMapY + _2D_Test_Game.Blocks.Block.BlockSizeY) | 0;
                    tmpDrawY = (tmpDrawY + _2D_Test_Game.Blocks.Block.BlockSizeY) | 0;
                }


                $t = Bridge.getEnumerator(this._projectiles);
                try {
                    while ($t.moveNext()) {
                        var projectile = $t.Current;
                        projectile.Draw(canvas, ((((drawPosX + projectile.X) | 0) - mapPosX) | 0), ((((drawPosY + projectile.Y) | 0) - mapPosY) | 0));

                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }


                this._player.Draw(canvas, (((Bridge.Int.div(width, 2)) | 0)), (((Bridge.Int.div(height, 2)) | 0)));
            },
            MovePlayer: function (mvX, mvY) {
                var blocksMvtX = Bridge.Int.clip32((this._player.X + mvX) / _2D_Test_Game.Blocks.Block.BlockSizeX);
                var blocksMvtY = Bridge.Int.clip32((this._player.Y + mvY) / _2D_Test_Game.Blocks.Block.BlockSizeY);


                if (mvX !== 0 && mvY !== 0) {
                    mvY = mvY / 1.6;
                    mvX = mvX / 1.6;
                }


                if (mvX < 0) {
                    var x = Bridge.Int.clip32(this._player.X + mvX + 0.5);
                    var blk = this.GetBlockAtXY(x, this._player.Y);
                    if (blk.Walkalble) {
                        this._player.X = x;
                    }
                } else if (mvX > 0) {
                    var x1 = Bridge.Int.clip32(this._player.X + mvX + 0.5);
                    var blk1 = this.GetBlockAtXY(((x1 + _2D_Test_Game.Player.Width) | 0), this._player.Y);
                    if (blk1.Walkalble) {
                        this._player.X = x1;
                    }
                }

                if (mvY < 0) {
                    var y = Bridge.Int.clip32(this._player.Y + mvY + 0.5);
                    var blk2 = this.GetBlockAtXY(this._player.X, y);
                    if (blk2.Walkalble) {
                        this._player.Y = y;
                    }
                } else if (mvY > 0) {
                    var y1 = Bridge.Int.clip32(this._player.Y + mvY + 0.5);
                    var blk3 = this.GetBlockAtXY(this._player.X, ((y1 + _2D_Test_Game.Player.Height) | 0));
                    if (blk3.Walkalble) {
                        this._player.Y = y1;
                    }
                }






            },
            Shoot: function () {
                var $t;
                System.Console.WriteLine("BOOM");
                this._projectiles.add(($t = new _2D_Test_Game.Projectiles.Rifleshot(), $t.Direction = Bridge.Int.clip32(this._player.DirectionDegrees), $t.X = ((this._player.X + (((Bridge.Int.div(_2D_Test_Game.Player.Width, 2)) | 0))) | 0), $t.Y = ((this._player.Y + (((Bridge.Int.div(_2D_Test_Game.Player.Height, 2)) | 0))) | 0), $t));
            },
            MoveProjectiles: function (ms) {
                for (var i = (this._projectiles.Count - 1) | 0; i >= 0; i = (i - 1) | 0) {
                    var projectile = this._projectiles.getItem(i);

                    projectile.Move(ms);
                    if (projectile.X < 0 || projectile.Y < 0 || projectile.X > (Bridge.Int.mul(System.Array.getLength(this._worldBlocks, 1), _2D_Test_Game.Blocks.Block.BlockSizeX)) || projectile.Y > (Bridge.Int.mul(System.Array.getLength(this._worldBlocks, 0), _2D_Test_Game.Blocks.Block.BlockSizeY))) {
                        this._projectiles.removeAt(i);
                        System.Console.WriteLine("rem proj");
                    }
                }
            }
        }
    });

    Bridge.define("_2D_Test_Game.Blocks.Dirt", {
        inherits: [_2D_Test_Game.Blocks.Block],
        statics: {
            fields: {
                File: null
            },
            ctors: {
                init: function () {
                    this.File = "img/DirtBlock.png";
                }
            }
        },
        fields: {
            _img: null
        },
        props: {
            Walkalble: {
                get: function () {
                    return true;
                }
            }
        },
        ctors: {
            ctor: function () {
                var $t;
                this.$initialize();
                _2D_Test_Game.Blocks.Block.ctor.call(this);
                this._img = ($t = new Image(), $t.src = _2D_Test_Game.Blocks.Dirt.File, $t);
            }
        },
        methods: {
            Draw: function (cnv, x, y) {
                cnv.drawImage(this._img, 0, 0, _2D_Test_Game.Blocks.Block.BlockSizeX, _2D_Test_Game.Blocks.Block.BlockSizeY, x, y, _2D_Test_Game.Blocks.Block.BlockSizeX, _2D_Test_Game.Blocks.Block.BlockSizeY);
            }
        }
    });

    Bridge.define("_2D_Test_Game.Blocks.Empty", {
        inherits: [_2D_Test_Game.Blocks.Block],
        props: {
            Walkalble: {
                get: function () {
                    return false;
                }
            }
        },
        ctors: {
            ctor: function () {
                this.$initialize();
                _2D_Test_Game.Blocks.Block.ctor.call(this);
            }
        },
        methods: {
            Draw: function (cnv, x, y) { }
        }
    });

    Bridge.define("_2D_Test_Game.Blocks.Grass", {
        inherits: [_2D_Test_Game.Blocks.Block],
        statics: {
            fields: {
                File: null
            },
            ctors: {
                init: function () {
                    this.File = "img/GrassBlock.png";
                }
            }
        },
        fields: {
            _img: null
        },
        props: {
            Walkalble: {
                get: function () {
                    return true;
                }
            }
        },
        ctors: {
            ctor: function () {
                var $t;
                this.$initialize();
                _2D_Test_Game.Blocks.Block.ctor.call(this);
                this._img = ($t = new Image(), $t.src = _2D_Test_Game.Blocks.Grass.File, $t);
            }
        },
        methods: {
            Draw: function (cnv, x, y) {
                cnv.drawImage(this._img, 0, 0, _2D_Test_Game.Blocks.Block.BlockSizeX, _2D_Test_Game.Blocks.Block.BlockSizeY, x, y, _2D_Test_Game.Blocks.Block.BlockSizeX, _2D_Test_Game.Blocks.Block.BlockSizeY);
            }
        }
    });

    Bridge.define("_2D_Test_Game.Blocks.Stone", {
        inherits: [_2D_Test_Game.Blocks.Block],
        statics: {
            fields: {
                File: null
            },
            ctors: {
                init: function () {
                    this.File = "img/StoneBlock.png";
                }
            }
        },
        fields: {
            _img: null
        },
        props: {
            Walkalble: {
                get: function () {
                    return false;
                }
            }
        },
        ctors: {
            ctor: function () {
                var $t;
                this.$initialize();
                _2D_Test_Game.Blocks.Block.ctor.call(this);
                this._img = ($t = new Image(), $t.src = _2D_Test_Game.Blocks.Stone.File, $t);
            }
        },
        methods: {
            Draw: function (cnv, x, y) {
                cnv.drawImage(this._img, 0, 0, _2D_Test_Game.Blocks.Block.BlockSizeX, _2D_Test_Game.Blocks.Block.BlockSizeY, x, y, _2D_Test_Game.Blocks.Block.BlockSizeX, _2D_Test_Game.Blocks.Block.BlockSizeY);
            }
        }
    });

    Bridge.define("_2D_Test_Game.Projectiles.Rifleshot", {
        inherits: [_2D_Test_Game.Projectiles.Projectile],
        fields: {
            Speed: 0
        },
        ctors: {
            init: function () {
                this.Speed = 1024;
            }
        },
        methods: {
            Draw: function (context, x, y) {
                context.fillStyle = "red";

                context.fillRect(x, y, 10, 10);

            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIyRF9UZXN0X0dhbWUuanMiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbIkJsb2Nrcy9CbG9jay5jcyIsIkRlYnVnSW5mby5jcyIsIkdhbWUuY3MiLCJQbGF5ZXIuY3MiLCJQcm9qZWN0aWxlcy9Qcm9qZWN0aWxlLmNzIiwiV29ybGQuY3MiLCJCbG9ja3MvRGlydC5jcyIsIkJsb2Nrcy9FbXB0eS5jcyIsIkJsb2Nrcy9HcmFzcy5jcyIsIkJsb2Nrcy9TdG9uZS5jcyIsIlByb2plY3RpbGVzL1JpZmxlc2hvdC5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBbUJRQSxPQUFPQSxJQUFJQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JDSVBBLHlCQUFrQkEsWUFBWUEsd0NBQWdCQTtvQkFDOUNBLHlCQUFrQkEsYUFBYUEseUNBQWlCQTtvQkFDaERBLHlCQUFrQkEsZ0JBQWdCQSwyQ0FBbUJBOzs7Ozs7Ozs7WUNickRBLFVBQVVBO1lBQ1ZBLDBCQUEwQkE7WUFDMUJBLFdBQVdBLElBQUlBLG1CQUFLQTtZQUNwQkEscURBQW1CQSxVQUFDQTtnQkFFaEJBOztZQUVKQSx1REFBb0JBLFVBQUNBO2dCQUVqQkEsY0FBY0E7O1lBRWxCQSxtREFBa0JBLFVBQUNBO2dCQUVmQSxnQkFBZ0JBOztZQUVwQkEsMkRBQXNCQSxVQUFDQTtnQkFFbkJBLGlCQUFpQkEsWUFBWUE7O1lBRWpDQSwyREFBc0JBLFVBQUNBO2dCQUVuQkEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7b0JBRWZBLGNBQWNBOzs7WUFHdEJBLHVEQUFvQkEsVUFBQ0E7Z0JBRWpCQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQTtvQkFFZkEsZ0JBQWdCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFhRkEsS0FBSUE7a0NBdUZBQTs7NEJBbEZsQkE7O2dCQUVSQSxtQkFBY0E7Z0JBQ2RBLDJCQUFzQkEsNEJBQXVCQTtnQkFDN0NB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QUFHQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxuXHJcbm5hbWVzcGFjZSBfMkRfVGVzdF9HYW1lLkJsb2Nrc1xyXG57XHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgY2xhc3MgQmxvY2tcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBCbG9ja1NpemVYID0zMjtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBCbG9ja1NpemVZID0gMzI7XHJcblxyXG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBib29sIFdhbGthbGJsZSB7IGdldDsgfVxyXG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCB2b2lkIERyYXcoQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIGNudiwgaW50IHgsIGludCB5KTtcclxucHVibGljIHN0YXRpYyBCbG9jayBFbXB0eUJsb2NrXHJcbntcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBuZXcgRW1wdHkoKTtcclxuICAgIH1cclxufSAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIF8yRF9UZXN0X0dhbWVcclxue1xyXG4gICAgcHVibGljIHN0YXRpYyBjbGFzcyBEZWJ1Z0luZm9cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBQbGF5ZXJYIHsgc2V0OyBnZXQ7IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBQbGF5ZXJZIHsgc2V0OyBnZXQ7IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBEcmF3WCB7IHNldDsgZ2V0OyB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgRHJhd1kgeyBzZXQ7IGdldDsgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IE1hcFggeyBzZXQ7IGdldDsgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IE1hcFkgeyBzZXQ7IGdldDsgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZG91YmxlIE1zUGVyRHJhdyB7IHNldDsgZ2V0OyB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgRHJhd1dpZHRoIHsgc2V0OyBnZXQ7IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBEcmF3SGVpZ2h0IHsgc2V0OyBnZXQ7IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBQbGF5ZXJMb29rRGVnIHsgc2V0O2dldDsgfVxyXG5cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIExvZygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShcIk1hcCBYOiBcIiArIE1hcFggKyBcIiBZOiBcIiArIE1hcFkpO1xyXG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShcIkRyYXcgWDogXCIgKyBEcmF3WCArIFwiIFk6IFwiICsgRHJhd1kpO1xyXG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShcIlBsYXllciAtIFg6XCIgKyBQbGF5ZXJYICsgXCIgWTogXCIgKyBQbGF5ZXJZKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG5cclxubmFtZXNwYWNlIF8yRF9UZXN0X0dhbWVcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEdhbWVcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgTWFpbigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgY252ID0gbmV3IEhUTUxDYW52YXNFbGVtZW50KCk7XHJcbiAgICAgICAgICAgIERvY3VtZW50LkJvZHkuQXBwZW5kQ2hpbGQoY252KTtcclxuICAgICAgICAgICAgdmFyIGdhbWUgPSBuZXcgR2FtZShjbnYpO1xyXG4gICAgICAgICAgICBXaW5kb3cuT25SZXNpemUgKz0gKGV2KSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnYW1lLlJlc2l6ZSgpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBXaW5kb3cuT25LZXlEb3duICs9IChLZXlib2FyZEV2ZW50IGV2KSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnYW1lLlByZXNzS2V5KGV2LktleUNvZGUpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBXaW5kb3cuT25LZXlVcCArPSAoS2V5Ym9hcmRFdmVudCBldikgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZ2FtZS5SZWxlYXNlS2V5KGV2LktleUNvZGUpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBXaW5kb3cuT25Nb3VzZU1vdmUgKz0gKE1vdXNlRXZlbnQgZXYpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGdhbWUuU2V0TW91c2VQb3MoZXYuQ2xpZW50WCwgZXYuQ2xpZW50WSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIFdpbmRvdy5Pbk1vdXNlRG93biArPSAoTW91c2VFdmVudCBldikgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKChldi5CdXR0b25zICYgKDEgPDwgMCkpID09IDEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2FtZS5QcmVzc0tleSgtMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIFdpbmRvdy5Pbk1vdXNlVXAgKz0gKE1vdXNlRXZlbnQgZXYpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICgoZXYuQnV0dG9ucyAmICgxIDw8IDApKSA9PSAwKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGdhbWUuUmVsZWFzZUtleSgtMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByaXZhdGUgSFRNTENhbnZhc0VsZW1lbnQgX21haW5DYW52YXM7XHJcbiAgICAgICAgcHJpdmF0ZSBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgX21haW5DYW52YXNSZW5kZXJlcjtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBEYXRlVGltZSBfbGFzdERyYXc7XHJcblxyXG4gICAgICAgIHByaXZhdGUgV29ybGQgX3dvcmxkO1xyXG4gICAgICAgIHByaXZhdGUgUGxheWVyIF9wbGF5ZXI7XHJcblxyXG4gICAgICAgIHByaXZhdGUgTGlzdDxpbnQ+IF9rZXlzID0gbmV3IExpc3Q8aW50PigpO1xyXG4gICAgICAgIHByaXZhdGUgaW50IF9tb3VzZVg7XHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgX21vdXNlWTtcclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIEdhbWUoSFRNTENhbnZhc0VsZW1lbnQgY2FudmFzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX21haW5DYW52YXMgPSBjYW52YXM7XHJcbiAgICAgICAgICAgIF9tYWluQ2FudmFzUmVuZGVyZXIgPSBfbWFpbkNhbnZhcy5HZXRDb250ZXh0KENhbnZhc1R5cGVzLkNhbnZhc0NvbnRleHQyRFR5cGUuQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKTtcclxuICAgICAgICAgICAgUmVzaXplKCk7XHJcblxyXG4gICAgICAgICAgICBfcGxheWVyID0gbmV3IFBsYXllcigpO1xyXG5cclxuICAgICAgICAgICAgX2xhc3REcmF3ID0gRGF0ZVRpbWUuTm93O1xyXG5cclxuICAgICAgICAgICAgX3dvcmxkID0gbmV3IFdvcmxkKF9wbGF5ZXIsIFwibWFwMS5qc29uXCIpO1xyXG4gICAgICAgICAgICBfd29ybGQuTG9hZGVkICs9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIFdpbmRvdy5SZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKEFjdGlvbilHYW1lRnJhbWUpO1xyXG5cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBQcmVzc0tleShpbnQga2V5Q29kZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghX2tleXMuQ29udGFpbnMoa2V5Q29kZSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIF9rZXlzLkFkZChrZXlDb2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZWxlYXNlS2V5KGludCBrZXlDb2RlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX2tleXMuUmVtb3ZlKGtleUNvZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgU2V0TW91c2VQb3MoaW50IHgsIGludCB5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX21vdXNlWCA9IHggO1xyXG4gICAgICAgICAgICBfbW91c2VZID0geTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBSZXNpemUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX21haW5DYW52YXMuV2lkdGggPSBXaW5kb3cuRG9jdW1lbnQuQm9keS5DbGllbnRXaWR0aDtcclxuICAgICAgICAgICAgX21haW5DYW52YXMuSGVpZ2h0ID0gV2luZG93LkRvY3VtZW50LkJvZHkuQ2xpZW50SGVpZ2h0IC0gODtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBHYW1lRnJhbWUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgSGFuZGxlTW92ZW1lbnQoKTtcclxuXHJcbiAgICAgICAgICAgIF93b3JsZC5Nb3ZlUHJvamVjdGlsZXMoKERhdGVUaW1lLk5vdyAtIF9sYXN0RHJhdykuVG90YWxNaWxsaXNlY29uZHMgKTtcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgX3dvcmxkLkRyYXcoX21haW5DYW52YXNSZW5kZXJlciwgX21haW5DYW52YXMuV2lkdGgsIF9tYWluQ2FudmFzLkhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICBcclxuXHJcblxyXG4gICAgICAgICAgICBEZWJ1Z0luZm8uTXNQZXJEcmF3ID0gICgoRGF0ZVRpbWUuTm93IC0gX2xhc3REcmF3KS5Ub3RhbE1pbGxpc2Vjb25kcyk7XHJcbiAgICAgICAgICAgIF9sYXN0RHJhdyA9IERhdGVUaW1lLk5vdztcclxuXHJcblxyXG4gICAgICAgICAgICBEcmF3RGVidWdJbmZvKCk7XHJcblxyXG4gICAgICAgICAgICAvL1dpbmRvdy5SZXF1ZXN0QW5pbWF0aW9uRnJhbWUoR2FtZUZyYW1lKTtcclxuICAgICAgICAgICAgV2luZG93LlNldFRpbWVvdXQoKEFjdGlvbilHYW1lRnJhbWUsIDApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBEcmF3RGVidWdJbmZvKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIF9tYWluQ2FudmFzUmVuZGVyZXIuRmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xyXG4gICAgICAgICAgICBfbWFpbkNhbnZhc1JlbmRlcmVyLkZvbnQgPSBcIjE2cHggQXJpYWxcIjtcclxuXHJcbiAgICAgICAgICAgIF9tYWluQ2FudmFzUmVuZGVyZXIuRmlsbFRleHQoXCJGUFM6IFwiICsgKCAoaW50KSgxMDAwIC8gRGVidWdJbmZvLk1zUGVyRHJhdykgKS5Ub1N0cmluZygpLCAwLCAxOCk7XHJcbiAgICAgICAgICAgIF9tYWluQ2FudmFzUmVuZGVyZXIuRmlsbFRleHQoXCJQbGF5ZXIgWDogXCIgKyBEZWJ1Z0luZm8uUGxheWVyWCArIFwiIFk6IFwiICsgRGVidWdJbmZvLlBsYXllclkgKyBcIiBWOiBcIiArIERlYnVnSW5mby5QbGF5ZXJMb29rRGVnLCAwLCAzNik7XHJcbiAgICAgICAgICAgIF9tYWluQ2FudmFzUmVuZGVyZXIuRmlsbFRleHQoXCJNYXAgWDogXCIgKyBEZWJ1Z0luZm8uTWFwWCArIFwiIFk6IFwiICsgRGVidWdJbmZvLk1hcFksIDAsIDU0KTtcclxuICAgICAgICAgICAgX21haW5DYW52YXNSZW5kZXJlci5GaWxsVGV4dChcIkRyYXcgWDogXCIgKyBEZWJ1Z0luZm8uRHJhd1ggKyBcIiBZOiBcIiArIERlYnVnSW5mby5EcmF3WSwgMCAsIDcyKTtcclxuICAgICAgICAgICAgX21haW5DYW52YXNSZW5kZXJlci5GaWxsVGV4dChcIlNjcmVlbiBXOiBcIiArRGVidWdJbmZvLkRyYXdXaWR0aCArIFwiIEg6IFwiICsgRGVidWdJbmZvLkRyYXdIZWlnaHQsIDAsIDkwKTtcclxuICAgICAgICAgICAgX21haW5DYW52YXNSZW5kZXJlci5GaWxsVGV4dChcIk1vdXNlIFg6IFwiICsgX21vdXNlWCArIFwiIFk6IFwiICsgX21vdXNlWSwgMCwgMTA4KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBEYXRlVGltZSBfbmV4dFNob290ID0gRGF0ZVRpbWUuTm93O1xyXG4gICAgICAgIHByaXZhdGUgdm9pZCBIYW5kbGVNb3ZlbWVudCgpXHJcbiAgICAgICAge1xyXG5cclxuXHJcbiAgICAgICAgICAgIGludCBjZW50ZXJZID0gKF9tYWluQ2FudmFzLkhlaWdodCAvIDIpICsgKFBsYXllci5IZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgaW50IGNlbnRlclggPSAoX21haW5DYW52YXMuV2lkdGggLyAyKSArIChQbGF5ZXIuV2lkdGggLyAyKTtcclxuXHJcblxyXG4gICAgICAgICAgICB2YXIgZm9vID0gTWF0aC5BdGFuMihjZW50ZXJZIC0gX21vdXNlWSwgY2VudGVyWCAtIF9tb3VzZVgpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGZvbyA9IGZvbyAqIDE4MCAvIE1hdGguUEk7XHJcbiAgICAgICAgICAgIGZvbyArPSAxODA7XHJcblxyXG4gICAgICAgICAgICBfcGxheWVyLkRpcmVjdGlvbkRlZ3JlZXMgPSBmb287XHJcbiAgICAgICAgICAgIERlYnVnSW5mby5QbGF5ZXJMb29rRGVnID0gKGludClfcGxheWVyLkRpcmVjdGlvbkRlZ3JlZXM7XHJcblxyXG4gICAgICAgICAgICBkb3VibGUgbXZudCA9ICgoRGF0ZVRpbWUuTm93IC0gX2xhc3REcmF3KS5Ub3RhbE1pbGxpc2Vjb25kcyAvIDEwMDApO1xyXG5cclxuICAgICAgICAgICAgZG91YmxlIG12bW50WD0gMCAsIG12bW50WSA9IDA7XHJcblxyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAodmFyIGtleSBpbiBfa2V5cylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy93XHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09IDg3KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG12bW50WSAtPSAoUGxheWVyLlNwZWVkICogbXZudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL2FcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PSA2NSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtdm1udFggLT0gKFBsYXllci5TcGVlZCAqIG12bnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9zXHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChrZXkgPT0gODMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbXZtbnRZICs9IChQbGF5ZXIuU3BlZWQgKiBtdm50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vZFxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09IDY4KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG12bW50WCArPSAoUGxheWVyLlNwZWVkICogbXZudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmKGtleSA9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihfbmV4dFNob290IDw9IERhdGVUaW1lLk5vdylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF93b3JsZC5TaG9vdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfbmV4dFNob290ID0gRGF0ZVRpbWUuTm93LkFkZE1pbGxpc2Vjb25kcygxMDApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfd29ybGQuTW92ZVBsYXllcihtdm1udFgsIG12bW50WSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG5cclxuXHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgXzJEX1Rlc3RfR2FtZVxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgUGxheWVyXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBzdHJpbmcgUGxheWVyR3JhcGhpY3MgPSBcImltZy9sYXJkX2tvcGZfdHJhbnNwYXJlbnQucG5nXCI7XHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBzdHJpbmcgV2VhcG9uR3JhcGhpY3MgPSBcImltZy9tNC5wbmdcIjtcclxuICAgICAgICBwcml2YXRlIEhUTUxJbWFnZUVsZW1lbnQgX2ltZ1BsYXllcjtcclxuICAgICAgICBwcml2YXRlIEhUTUxJbWFnZUVsZW1lbnQgX2ltZ1dlYXBvbjtcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgV2lkdGggPSAzMjtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBIZWlnaHQgPSA0ODtcclxuICAgICAgICBwdWJsaWMgY29uc3QgZmxvYXQgU3BlZWQgPSA3Njg7XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgWCB7IHNldDsgZ2V0OyB9XHJcbiAgICAgICAgcHVibGljIGludCBZIHsgc2V0OyBnZXQ7IH1cclxuXHJcbiAgICAgICAgcHVibGljIGRvdWJsZSBEaXJlY3Rpb25EZWdyZWVzIHsgc2V0OyBnZXQ7IH1cclxuXHJcblxyXG4gICAgICAgIHB1YmxpYyBQbGF5ZXIoKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIF9pbWdQbGF5ZXIgPSBuZXcgSFRNTEltYWdlRWxlbWVudCgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNyYyA9IFBsYXllckdyYXBoaWNzXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIF9pbWdXZWFwb24gPSBuZXcgSFRNTEltYWdlRWxlbWVudCgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNyYyA9IFdlYXBvbkdyYXBoaWNzXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3KENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCBjbnYsIGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNudi5EcmF3SW1hZ2UoX2ltZ1BsYXllciwgMCwgMCwgX2ltZ1BsYXllci5XaWR0aCwgX2ltZ1BsYXllci5IZWlnaHQsIHgsIHksICBXaWR0aCwgSGVpZ2h0KTtcclxuICAgICAgICAgICAgLy9jbnYuU3Ryb2tlUmVjdCh4LCB5LCBXaWR0aCwgSGVpZ2h0KTtcclxuICAgICAgICAgICAgY252LlNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIG1vdmUgdG8gdGhlIGNlbnRlciBvZiB0aGUgY2FudmFzXHJcbiAgICAgICAgICAgIGNudi5UcmFuc2xhdGUoeCArIChQbGF5ZXIuV2lkdGggIC8gMiksIHkgKyAoUGxheWVyLkhlaWdodCAvIDIpKTtcclxuICAgICAgICAgICAgLy9jbnYuRmlsbFJlY3QoMCwgMCwgMjAsIDIwKTtcclxuICAgICAgICAgICAgY252LlJvdGF0ZSgoZG91YmxlKURpcmVjdGlvbkRlZ3JlZXMgLyAoMTgwIC9NYXRoLlBJKSk7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNudi5EcmF3SW1hZ2UoX2ltZ1dlYXBvbiwgMCwwLCBfaW1nV2VhcG9uLldpZHRoLCBfaW1nV2VhcG9uLkhlaWdodCwgMCAgLC01LCBXaWR0aCAqMS41LCBIZWlnaHQgLyAyKTsgICAgICAgICAgICBcclxuICAgICAgICAgICAgY252LlJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcblxuXHJcbiAgICBcbnByaXZhdGUgaW50IF9fUHJvcGVydHlfX0luaXRpYWxpemVyX19YPTMyO3ByaXZhdGUgaW50IF9fUHJvcGVydHlfX0luaXRpYWxpemVyX19ZPTMyO3ByaXZhdGUgZG91YmxlIF9fUHJvcGVydHlfX0luaXRpYWxpemVyX19EaXJlY3Rpb25EZWdyZWVzPTA7fVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG5cclxubmFtZXNwYWNlIF8yRF9UZXN0X0dhbWUuUHJvamVjdGlsZXNcclxue1xyXG4gICAgcHVibGljIGFic3RyYWN0IGNsYXNzIFByb2plY3RpbGVcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgaW50IFggeyBzZXQ7IGdldDsgfVxyXG4gICAgICAgIHB1YmxpYyBpbnQgWSB7IHNldDsgZ2V0OyB9XHJcbiAgICAgICAgcHVibGljIGFic3RyYWN0IGRvdWJsZSBTcGVlZCB7IHNldDsgZ2V0OyB9XHJcbiAgICAgICAgcHVibGljIGludCBEaXJlY3Rpb24geyBzZXQ7IGdldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBNb3ZlIChkb3VibGUgbXMpXHJcbiAgICAgICAge1xyXG5cclxuXHJcbiAgICAgICAgICAgIFggKz0gKGludCkgICgoU3BlZWQgKiAoIG1zIC8gMTAwMCApICsgMC41KSAqIE1hdGguQ29zKERpcmVjdGlvbiAvICgxODAgLyBNYXRoLlBJKSkpO1xyXG4gICAgICAgICAgICBZICs9IChpbnQpICAoKFNwZWVkICogKCBtcyAvIDEwMDAgKSArIDAuNSkgKiBNYXRoLlNpbihEaXJlY3Rpb24gLyAoMTgwIC8gTWF0aC5QSSkpKTtcclxuXHJcbiAgICAgICAgICAgIC8vWCArPSAoaW50KSgoU3BlZWQgKiAoIDEwMDAgL21zICkpICogTWF0aC5Db3MoRGlyZWN0aW9uKSArIDAuNSk7XHJcbiAgICAgICAgICAgIC8vWSArPSAoaW50KSgoU3BlZWQgKiAoIDEwMDAvIG1zICkpICogTWF0aC5TaW4oRGlyZWN0aW9uKSArIDAuNSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGFic3RyYWN0IHZvaWQgRHJhdyhDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgY29udGV4dCwgaW50IHN0YXJ0WCwgaW50IHN0YXJ0WSk7XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIF8yRF9UZXN0X0dhbWVcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFdvcmxkXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIFdvcmxkKFBsYXllciBwbGF5ZXIsIHN0cmluZyBmaWxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX3BsYXllciA9IHBsYXllcjtcclxuICAgICAgICAgICAgTG9hZE1hcChmaWxlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBBY3Rpb24gTG9hZGVkO1xyXG5cclxuICAgICAgICBwcml2YXRlIEJsb2Nrcy5CbG9ja1ssXSBfd29ybGRCbG9ja3M7XHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PFByb2plY3RpbGVzLlByb2plY3RpbGU+IF9wcm9qZWN0aWxlcyA9IG5ldyBMaXN0PFByb2plY3RpbGVzLlByb2plY3RpbGU+KCk7XHJcbiAgICAgICAgcHVibGljIFBsYXllciBfcGxheWVyO1xyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgTG9hZE1hcChzdHJpbmcgZmlsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBqc29uID0gQnJpZGdlLmpRdWVyeTIualF1ZXJ5LkdldEpTT04oZmlsZSwgbnVsbCwgbmV3IEFjdGlvbjxvYmplY3Q+KChkYXRhKSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvL2ludFssXSBtYXAgPSBCcmlkZ2UuSHRtbDUuSlNPTi5QYXJzZTxpbnRbLF0+KGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgaW50WyxdIG1hcCA9IChpbnRbLF0pZGF0YTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZERhdGEgPSBkYXRhLlRvRHluYW1pYygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGludCB3ID0gMCwgaCA9MDtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKGludFtdIHIgaW4gZERhdGEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoaCA9PTApXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JlYWNoIChpbnQgYmwgaW4gcilcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdysrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGgrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF93b3JsZEJsb2NrcyA9IG5ldyBCbG9ja3MuQmxvY2tbaCwgd107XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGkgPSAwLCBqID0gMDtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKGludFtdIHIgaW4gZERhdGEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaiA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yZWFjaCAoaW50IGJsIGluIHIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGJsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICgwKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfd29ybGRCbG9ja3NbaSwgal0gPSBuZXcgQmxvY2tzLkVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICgxKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfd29ybGRCbG9ja3NbaSwgal0gPSBuZXcgQmxvY2tzLlN0b25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICgyKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfd29ybGRCbG9ja3NbaSwgal0gPSBuZXcgQmxvY2tzLkdyYXNzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICgzKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfd29ybGRCbG9ja3NbaSwgal0gPSBuZXcgQmxvY2tzLkRpcnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3dvcmxkQmxvY2tzW2ksIGpdID0gbmV3IEJsb2Nrcy5FbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGorKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBMb2FkZWQoKTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgLy9wcml2YXRlIHZvaWQgQnVpbGREZW1vV29ybGQoKVxyXG4gICAgICAgIC8ve1xyXG4gICAgICAgIC8vICAgIF93b3JsZEJsb2NrcyA9IG5ldyBCbG9ja3MuQmxvY2tbNjQsNjRdO1xyXG5cclxuICAgICAgICAvLyAgICBmb3IgKGludCBpID0gMDsgaSA8IF93b3JsZEJsb2Nrcy5HZXRMZW5ndGgoMCk7IGkrKylcclxuICAgICAgICAvLyAgICB7XHJcbiAgICAgICAgLy8gICAgICAgIGZvciAoaW50IGogPSAwOyBqIDwgX3dvcmxkQmxvY2tzLkdldExlbmd0aCgxKTsgaisrKVxyXG4gICAgICAgIC8vICAgICAgICB7XHJcbiAgICAgICAgLy8gICAgICAgICAgICBpZihpID09IDB8fCBqID09IDB8fCBpID09IF93b3JsZEJsb2Nrcy5HZXRMZW5ndGgoMCkgLSAxfHwgaiA9PSBfd29ybGRCbG9ja3MuR2V0TGVuZ3RoKDEpIC0gMSlcclxuICAgICAgICAvLyAgICAgICAgICAgIHtcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICBfd29ybGRCbG9ja3NbaSwgal0gPSBuZXcgQmxvY2tzLlN0b25lKCk7XHJcbiAgICAgICAgLy8gICAgICAgICAgICB9XHJcbiAgICAgICAgLy8gICAgICAgICAgICBlbHNlIGlmIChpID09IDIgfHwgaiA9PSAyIHx8IGkgPT0gX3dvcmxkQmxvY2tzLkdldExlbmd0aCgwKSAtIDIgfHwgaiA9PSBfd29ybGRCbG9ja3MuR2V0TGVuZ3RoKDEpIC0gMilcclxuICAgICAgICAvLyAgICAgICAgICAgIHtcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICBfd29ybGRCbG9ja3NbaSwgal0gPSBuZXcgQmxvY2tzLkRpcnQoKTtcclxuICAgICAgICAvLyAgICAgICAgICAgIH1cclxuICAgICAgICAvLyAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAvLyAgICAgICAgICAgIHtcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICBfd29ybGRCbG9ja3NbaSwgal0gPSBuZXcgQmxvY2tzLkdyYXNzKCk7XHJcbiAgICAgICAgLy8gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgLy8gICAgICAgIH1cclxuICAgICAgICAvLyAgICB9XHJcbiAgICAgICAgLy99XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHJpdmF0ZSBCbG9ja3MuQmxvY2sgR2V0QmxvY2tBdFhZKGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh4IDwgMCB8fCB5IDwgMCkgcmV0dXJuIEJsb2Nrcy5CbG9jay5FbXB0eUJsb2NrO1xyXG4gICAgICAgICAgICBpZiAoeCA+PSBfd29ybGRCbG9ja3MuR2V0TGVuZ3RoKDEpICogQmxvY2tzLkJsb2NrLkJsb2NrU2l6ZVggfHwgeSA+PSBfd29ybGRCbG9ja3MuR2V0TGVuZ3RoKDApICogQmxvY2tzLkJsb2NrLkJsb2NrU2l6ZVkpIHJldHVybiBCbG9ja3MuQmxvY2suRW1wdHlCbG9jaztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiBfd29ybGRCbG9ja3NbeSAvIEJsb2Nrcy5CbG9jay5CbG9ja1NpemVZLCB4IC8gQmxvY2tzLkJsb2NrLkJsb2NrU2l6ZVhdOyAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIERyYXcoQnJpZGdlLkh0bWw1LkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCBjYW52YXMsIGludCB3aWR0aCwgaW50IGhlaWdodClcclxuICAgICAgICB7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vZHJhdyBibGFjayBiZ1xyXG4gICAgICAgICAgICBjYW52YXMuRmlsbFN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgICAgICBjYW52YXMuRmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcblxyXG5cclxuICAgICAgICAgICAgLy9kcmF3IHdvcmxkXHJcbiAgICAgICAgICAgIGludCBtYXBQb3NYLCBtYXBQb3NZO1xyXG4gICAgICAgICAgICBpbnQgZHJhd1Bvc1ggPSAwLCBkcmF3UG9zWSA9IDA7XHJcblxyXG4gICAgICAgICAgICBtYXBQb3NYID0gX3BsYXllci5YIC0gKHdpZHRoIC8gMik7XHJcbiAgICAgICAgICAgIG1hcFBvc1kgPSBfcGxheWVyLlkgLSAoaGVpZ2h0IC8gMik7XHJcblxyXG4gICAgICAgICAgICBpZihtYXBQb3NYIDwgMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZHJhd1Bvc1ggPSAtbWFwUG9zWDtcclxuICAgICAgICAgICAgICAgIG1hcFBvc1ggPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKG1hcFBvc1kgPCAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmF3UG9zWSA9IC1tYXBQb3NZO1xyXG4gICAgICAgICAgICAgICAgbWFwUG9zWSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICBEZWJ1Z0luZm8uRHJhd1ggPSBkcmF3UG9zWDtcclxuICAgICAgICAgICAgRGVidWdJbmZvLkRyYXdZID0gZHJhd1Bvc1k7XHJcbiAgICAgICAgICAgIERlYnVnSW5mby5NYXBYID0gbWFwUG9zWDtcclxuICAgICAgICAgICAgRGVidWdJbmZvLk1hcFkgPSBtYXBQb3NZO1xyXG4gICAgICAgICAgICBEZWJ1Z0luZm8uUGxheWVyWCA9IF9wbGF5ZXIuWDtcclxuICAgICAgICAgICAgRGVidWdJbmZvLlBsYXllclkgPSBfcGxheWVyLlk7XHJcbiAgICAgICAgICAgIERlYnVnSW5mby5EcmF3SGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICBEZWJ1Z0luZm8uRHJhd1dpZHRoID0gd2lkdGg7XHJcblxyXG4gICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgIGludCB0bXBEcmF3WCwgdG1wTWFwWDtcclxuICAgICAgICAgICAgaW50IHRtcE1hcFkgPSBtYXBQb3NZO1xyXG4gICAgICAgICAgICBpbnQgdG1wRHJhd1kgPSBkcmF3UG9zWTtcclxuXHJcbiAgICAgICAgICAgIC8vZ28gZG93biBZISFcclxuICAgICAgICAgICAgd2hpbGUgKHRtcERyYXdZIDwgaGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0bXBEcmF3WCA9IGRyYXdQb3NYO1xyXG4gICAgICAgICAgICAgICAgdG1wTWFwWCA9IG1hcFBvc1g7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9nbyByaWdodCBYISEhXHJcbiAgICAgICAgICAgICAgICB3aGlsZSh0bXBEcmF3WCA8IHdpZHRoKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBibG9jayA9IEdldEJsb2NrQXRYWSh0bXBNYXBYLCB0bXBNYXBZKTtcclxuICAgICAgICAgICAgICAgICAgICBibG9jay5EcmF3KGNhbnZhcywgdG1wRHJhd1ggLSAobWFwUG9zWCAlIEJsb2Nrcy5CbG9jay5CbG9ja1NpemVYKSwgdG1wRHJhd1kgLSAodG1wTWFwWSAlIEJsb2Nrcy5CbG9jay5CbG9ja1NpemVZKSk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0bXBNYXBYICs9IEJsb2Nrcy5CbG9jay5CbG9ja1NpemVYO1xyXG4gICAgICAgICAgICAgICAgICAgIHRtcERyYXdYICs9IEJsb2Nrcy5CbG9jay5CbG9ja1NpemVYO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdG1wTWFwWSArPSBCbG9ja3MuQmxvY2suQmxvY2tTaXplWTtcclxuICAgICAgICAgICAgICAgIHRtcERyYXdZICs9IEJsb2Nrcy5CbG9jay5CbG9ja1NpemVZO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgLy9kcmF3IHByb2plY3RpbGVzXHJcbiAgICAgICAgICAgIGZvcmVhY2godmFyIHByb2plY3RpbGUgaW4gX3Byb2plY3RpbGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBwcm9qZWN0aWxlLkRyYXcoY2FudmFzLCAgZHJhd1Bvc1ggKyBwcm9qZWN0aWxlLlggLSBtYXBQb3NYLCBkcmF3UG9zWSArICBwcm9qZWN0aWxlLlkgLSBtYXBQb3NZKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAvL2RyYXcgcGxheWVyXHJcbiAgICAgICAgICAgIF9wbGF5ZXIuRHJhdyhjYW52YXMsKHdpZHRoIC8gMiksIChoZWlnaHQgLyAyKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgdm9pZCBNb3ZlUGxheWVyKGRvdWJsZSBtdlgsIGRvdWJsZSBtdlkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgYmxvY2tzTXZ0WCA9IChpbnQpKChfcGxheWVyLlggKyBtdlgpIC8gQmxvY2tzLkJsb2NrLkJsb2NrU2l6ZVgpO1xyXG4gICAgICAgICAgICBpbnQgYmxvY2tzTXZ0WSA9IChpbnQpKChfcGxheWVyLlkgKyBtdlkpIC8gQmxvY2tzLkJsb2NrLkJsb2NrU2l6ZVkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKG12WCAhPSAwICYmIG12WSAhPSAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtdlkgPSBtdlkgLyAxLjY7XHJcbiAgICAgICAgICAgICAgICBtdlggPSBtdlggLyAxLjY7XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAvL21vdmUgbGVmdFxyXG4gICAgICAgICAgICBpZihtdlggPCAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgeCA9IChpbnQpKF9wbGF5ZXIuWCArIG12WCArIDAuNSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgYmxrID0gR2V0QmxvY2tBdFhZKHgsIF9wbGF5ZXIuWSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYmxrLldhbGthbGJsZSkgX3BsYXllci5YID0geDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL21vdmUgcmlnaHRcclxuICAgICAgICAgICAgZWxzZSBpZihtdlggPiAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgeCA9IChpbnQpKF9wbGF5ZXIuWCArIG12WCArIDAuNSApO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJsayA9IEdldEJsb2NrQXRYWSh4ICsgUGxheWVyLldpZHRoLCBfcGxheWVyLlkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGJsay5XYWxrYWxibGUpIF9wbGF5ZXIuWCA9IHg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vbW92ZSB1cFxyXG4gICAgICAgICAgICBpZiAobXZZIDwgMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHkgPSAoaW50KShfcGxheWVyLlkgKyBtdlkgKyAwLjUpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJsayA9IEdldEJsb2NrQXRYWShfcGxheWVyLlgsIHkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGJsay5XYWxrYWxibGUpIF9wbGF5ZXIuWSA9IHk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9tb3ZlIGRvd25cclxuICAgICAgICAgICAgZWxzZSBpZiAobXZZID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHkgPSAoaW50KShfcGxheWVyLlkgKyBtdlkgKyAwLjUgKTtcclxuICAgICAgICAgICAgICAgIHZhciBibGsgPSBHZXRCbG9ja0F0WFkoX3BsYXllci5YLCB5KyBQbGF5ZXIuSGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGlmIChibGsuV2Fsa2FsYmxlKSBfcGxheWVyLlkgPSB5O1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgICAgICAgICAgLy9nZXQgbGVmdCBibG9ja1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNob290KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKFwiQk9PTVwiKTtcclxuICAgICAgICAgICAgX3Byb2plY3RpbGVzLkFkZChuZXcgUHJvamVjdGlsZXMuUmlmbGVzaG90KClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgRGlyZWN0aW9uID0gKGludCkgX3BsYXllci5EaXJlY3Rpb25EZWdyZWVzLFxyXG4gICAgICAgICAgICAgICAgWCA9IF9wbGF5ZXIuWCArIChQbGF5ZXIuV2lkdGggLyAyKSxcclxuICAgICAgICAgICAgICAgIFkgPSBfcGxheWVyLlkgKyAoUGxheWVyLkhlaWdodCAvIDIpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgTW92ZVByb2plY3RpbGVzKGRvdWJsZSBtcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSBfcHJvamVjdGlsZXMuQ291bnQgLTE7IGkgPj0wIDsgaS0tKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvamVjdGlsZSA9IF9wcm9qZWN0aWxlc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBwcm9qZWN0aWxlLk1vdmUobXMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByb2plY3RpbGUuWCA8IDAgfHwgcHJvamVjdGlsZS5ZIDwgMCB8fCBwcm9qZWN0aWxlLlggPiAoX3dvcmxkQmxvY2tzLkdldExlbmd0aCgxKSAqIEJsb2Nrcy5CbG9jay5CbG9ja1NpemVYKSB8fCBwcm9qZWN0aWxlLlkgPiAoX3dvcmxkQmxvY2tzLkdldExlbmd0aCgwKSAqIEJsb2Nrcy5CbG9jay5CbG9ja1NpemVZKSlcclxuICAgICAgICAgICAgICAgIHsgXHJcbiAgICAgICAgICAgICAgICAgICAgX3Byb2plY3RpbGVzLlJlbW92ZUF0KGkpO1xyXG4gICAgICAgICAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKFwicmVtIHByb2pcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBCcmlkZ2UuSHRtbDU7XHJcblxyXG5uYW1lc3BhY2UgXzJEX1Rlc3RfR2FtZS5CbG9ja3Ncclxue1xyXG4gICAgcHVibGljIGNsYXNzIERpcnQgOiBCbG9ja1xyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgY29uc3Qgc3RyaW5nIEZpbGUgPSBcImltZy9EaXJ0QmxvY2sucG5nXCI7XHJcbiAgICAgICAgcHJpdmF0ZSBIVE1MSW1hZ2VFbGVtZW50IF9pbWc7XHJcblxyXG4gICAgICAgIHB1YmxpYyBEaXJ0KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIF9pbWcgPSBuZXcgSFRNTEltYWdlRWxlbWVudCgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNyYyA9IEZpbGVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbnB1YmxpYyBvdmVycmlkZSBib29sIFdhbGthbGJsZVxyXG57XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIERyYXcoQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIGNudiwgaW50IHgsIGludCB5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY252LkRyYXdJbWFnZShfaW1nLCAwLDAsIEJsb2NrU2l6ZVgsIEJsb2NrU2l6ZVksIHgseSwgQmxvY2tTaXplWCwgQmxvY2tTaXplWSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG5cclxubmFtZXNwYWNlIF8yRF9UZXN0X0dhbWUuQmxvY2tzXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBFbXB0eSA6IEJsb2NrXHJcbiAgICB7XHJcblxyXG4gICAgICAgIHB1YmxpYyBFbXB0eSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgIH1cclxucHVibGljIG92ZXJyaWRlIGJvb2wgV2Fsa2FsYmxlXHJcbntcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIERyYXcoQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIGNudiwgaW50IHgsIGludCB5KVxyXG4gICAgICAgIHtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBCcmlkZ2UuSHRtbDU7XHJcblxyXG5uYW1lc3BhY2UgXzJEX1Rlc3RfR2FtZS5CbG9ja3Ncclxue1xyXG4gICAgcHVibGljIGNsYXNzIEdyYXNzIDogQmxvY2tcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIGNvbnN0IHN0cmluZyBGaWxlID0gXCJpbWcvR3Jhc3NCbG9jay5wbmdcIjtcclxuICAgICAgICBwcml2YXRlIEhUTUxJbWFnZUVsZW1lbnQgX2ltZztcclxucHVibGljIG92ZXJyaWRlIGJvb2wgV2Fsa2FsYmxlXHJcbntcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbiAgICAgICAgcHVibGljIEdyYXNzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIF9pbWcgPSBuZXcgSFRNTEltYWdlRWxlbWVudCgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNyYyA9IEZpbGVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgRHJhdyhDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgY252LCBpbnQgeCwgaW50IHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjbnYuRHJhd0ltYWdlKF9pbWcsIDAsMCwgQmxvY2tTaXplWCwgQmxvY2tTaXplWSwgeCx5LCBCbG9ja1NpemVYLCBCbG9ja1NpemVZKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBCcmlkZ2UuSHRtbDU7XHJcblxyXG5uYW1lc3BhY2UgXzJEX1Rlc3RfR2FtZS5CbG9ja3Ncclxue1xyXG4gICAgcHVibGljIGNsYXNzIFN0b25lIDogQmxvY2tcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIGNvbnN0IHN0cmluZyBGaWxlID0gXCJpbWcvU3RvbmVCbG9jay5wbmdcIjtcclxuICAgICAgICBwcml2YXRlIEhUTUxJbWFnZUVsZW1lbnQgX2ltZztcclxuXHJcbiAgICAgICAgcHVibGljIFN0b25lKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIF9pbWcgPSBuZXcgSFRNTEltYWdlRWxlbWVudCgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNyYyA9IEZpbGVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbnB1YmxpYyBvdmVycmlkZSBib29sIFdhbGthbGJsZVxyXG57XHJcbiAgICBnZXRcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCBjbnYsIGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNudi5EcmF3SW1hZ2UoX2ltZywgMCwwLCBCbG9ja1NpemVYLCBCbG9ja1NpemVZLCB4LHksIEJsb2NrU2l6ZVgsIEJsb2NrU2l6ZVkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxuXHJcbm5hbWVzcGFjZSBfMkRfVGVzdF9HYW1lLlByb2plY3RpbGVzXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBSaWZsZXNob3QgOiBQcm9qZWN0aWxlXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIGRvdWJsZSBTcGVlZCB7IHNldDsgZ2V0OyB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIERyYXcoQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIGNvbnRleHQsIGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnRleHQuRmlsbFN0eWxlID0gXCJyZWRcIjtcclxuXHJcbiAgICAgICAgICAgIGNvbnRleHQuRmlsbFJlY3QoeCwgeSwgMTAsIDEwKTtcclxuICAgICAgICAgICAgLy9jbnYuU2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8vLyBtb3ZlIHRvIHRoZSBjZW50ZXIgb2YgdGhlIGNhbnZhc1xyXG4gICAgICAgICAgICAvL2Nudi5UcmFuc2xhdGUoeCArIChQbGF5ZXIuV2lkdGggLyAyKSwgeSArIChQbGF5ZXIuSGVpZ2h0IC8gMikpO1xyXG4gICAgICAgICAgICAvLy8vY252LkZpbGxSZWN0KDAsIDAsIDIwLCAyMCk7XHJcbiAgICAgICAgICAgIC8vY252LlJvdGF0ZSgoZG91YmxlKURpcmVjdGlvbkRlZ3JlZXMgLyAoMTgwIC8gTWF0aC5QSSkpO1xyXG4gICAgICAgICAgICAvL2Nudi5EcmF3SW1hZ2UoX2ltZ1dlYXBvbiwgMCwgMCwgX2ltZ1dlYXBvbi5XaWR0aCwgX2ltZ1dlYXBvbi5IZWlnaHQsIDAsIC01LCBXaWR0aCAqIDEuNSwgSGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgIC8vY252LlJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcblxuICAgIFxucHJpdmF0ZSBkb3VibGUgX19Qcm9wZXJ0eV9fSW5pdGlhbGl6ZXJfX1NwZWVkPTEwMjQ7fVxyXG5cclxufVxyXG4iXQp9Cg==
