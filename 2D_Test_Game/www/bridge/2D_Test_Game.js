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
        statics: {
            fields: {
                TickRate: 0
            },
            ctors: {
                init: function () {
                    this.TickRate = 100;
                }
            }
        },
        fields: {
            _mainCanvas: null,
            _mainCanvasRenderer: null,
            _shadowCanvas: null,
            _shadowCanvas2D: null,
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
                var $t;
                this.$initialize();
                this._mainCanvas = canvas;
                this._mainCanvasRenderer = this._mainCanvas.getContext("2d");

                this._shadowCanvas = ($t = document.createElement("canvas"), $t.width = this._mainCanvas.width, $t.height = this._mainCanvas.height, $t);
                this._shadowCanvas2D = this._shadowCanvas.getContext("2d");


                this.Resize();

                this._player = new _2D_Test_Game.Player();

                this._lastDraw = System.DateTime.getNow();

                this._world = new _2D_Test_Game.World(this._player, "map1.json");
                this._world.Loaded = Bridge.fn.combine(this._world.Loaded, Bridge.fn.bind(this, function () {
                    window.setTimeout(Bridge.fn.cacheBind(this, this.GameTick), 10);
                    window.requestAnimationFrame(Bridge.fn.cacheBind(this, this.GameFrame));
                    this._player.X = 500;
                    this._player.Y = 500;
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
                this._shadowCanvas.width = window.document.body.clientWidth;
                this._shadowCanvas.height = (window.document.body.clientHeight - 8) | 0;
            },
            GameTick: function () {
                this.HandleMovement(10);

                this._world.MoveProjectiles(10);
                window.setTimeout(Bridge.fn.cacheBind(this, this.GameTick), 10);
                this._world.AnimateLight();

            },
            GameFrame: function () {
                this._world.Draw(this._mainCanvasRenderer, this._shadowCanvas2D, this._mainCanvas.width, this._mainCanvas.height);


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
            HandleMovement: function (ms) {
                var $t;


                var centerY = ((((Bridge.Int.div(this._mainCanvas.height, 2)) | 0)) + (((Bridge.Int.div(_2D_Test_Game.Player.Height, 2)) | 0))) | 0;
                var centerX = ((((Bridge.Int.div(this._mainCanvas.width, 2)) | 0)) + (((Bridge.Int.div(_2D_Test_Game.Player.Width, 2)) | 0))) | 0;


                var foo = Math.atan2(((centerY - this._mouseY) | 0), ((centerX - this._mouseX) | 0));


                foo = foo * 180 / Math.PI;
                foo += 180;

                this._player.DirectionDegrees = foo;
                _2D_Test_Game.DebugInfo.PlayerLookDeg = Bridge.Int.clip32(this._player.DirectionDegrees);

                var mvnt = ms / 1000;

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

    Bridge.define("_2D_Test_Game.Light", {
        fields: {
            X: 0,
            Y: 0,
            Type: 0,
            Brightness: 0,
            BrightDown: false
        },
        ctors: {
            ctor: function () {
                this.$initialize();
                this.X = 0;
                this.Y = 0;
                this.Type = 0;
                this.Brightness = 100;
                this.BrightDown = false;
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
            _lights: null,
            _projectiles: null,
            _player: null,
            _img: null
        },
        ctors: {
            init: function () {
                this._lights = new (System.Collections.Generic.List$1(_2D_Test_Game.Light)).ctor();
                this._projectiles = new (System.Collections.Generic.List$1(_2D_Test_Game.Projectiles.Projectile)).ctor();
            },
            ctor: function (player, file) {
                var $t;
                this.$initialize();
                this._player = player;
                this.LoadMap(file);
                this._img = ($t = new Image(), $t.src = "img/backgr.png", $t);
            }
        },
        methods: {
            LoadMap: function (file) {
                var json = $.getJSON(file, null, Bridge.fn.bind(this, function (data) {
                    var $t, $t1, $t2, $t3, $t4, $t5;

                    var dData = data;

                    var w = 0, h = 0;
                    $t = Bridge.getEnumerator(dData.blocks);
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
                    $t2 = Bridge.getEnumerator(dData.blocks);
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

                    $t4 = Bridge.getEnumerator(dData.lights);
                    try {
                        while ($t4.moveNext()) {
                            var l = Bridge.cast($t4.Current, System.Array.type(System.Int32));
                            this._lights.add(($t5 = new _2D_Test_Game.Light(), $t5.Type = l[System.Array.index(0, l)], $t5.X = l[System.Array.index(1, l)], $t5.Y = l[System.Array.index(2, l)], $t5));
                        }
                    } finally {
                        if (Bridge.is($t4, System.IDisposable)) {
                            $t4.System$IDisposable$Dispose();
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
            Draw: function (canvas, shadowContext, width, height) {
                var $t, $t1;
                canvas.drawImage(this._img, 0, 0, width, height);

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






                /* ct.GlobalAlpha = 0.5f;
                ct.FillStyle = "rgba(0,0,0,0.3)";
                ct.FillRect(0, 0, width, height);
                ct.FillStyle = "rgba(255,255,255,0.3)";
                ct.BeginPath();
                ct.Arc(250, 250, 20, 0, 2 * Math.PI);
                ct.Fill();
                ct.GlobalCompositeOperation = Bridge.Html5.CanvasTypes.CanvasCompositeOperationType.Lighten;
                */







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




                shadowContext.globalCompositeOperation = "source-over";
                shadowContext.fillStyle = "#000";
                shadowContext.fillRect(0, 0, width, height);
                shadowContext.globalCompositeOperation = "destination-out";

                shadowContext.fillStyle = "rgb(0,0,0,0.3)";
                shadowContext.fillRect(0, 0, width, height);
                $t1 = Bridge.getEnumerator(this._lights);
                try {
                    while ($t1.moveNext()) {
                        var light = $t1.Current;
                        var rad = 100;
                        if (light.Type === 2) {
                            rad = 500;
                        }
                        var lGrd = shadowContext.createRadialGradient(((((drawPosX - mapPosX) | 0) + light.X) | 0), ((((drawPosY - mapPosY) | 0) + light.Y) | 0), 0, ((((drawPosX - mapPosX) | 0) + light.X) | 0), ((((drawPosY - mapPosY) | 0) + light.Y) | 0), rad);

                        lGrd.addColorStop(0, "rgba(255,255,255," + System.Double.format(Bridge.Math.round((light.Brightness / 100), 2, 6)) + ")");
                        lGrd.addColorStop(1, "rgba(255,255,255,0.0)");
                        shadowContext.fillStyle = lGrd;
                        shadowContext.fillRect(0, 0, width, height);
                    }
                } finally {
                    if (Bridge.is($t1, System.IDisposable)) {
                        $t1.System$IDisposable$Dispose();
                    }
                }


                canvas.drawImage(shadowContext.canvas, 0, 0, width, height);
            },
            AnimateLight: function () {
                var $t;
                $t = Bridge.getEnumerator(this._lights);
                try {
                    while ($t.moveNext()) {
                        var l = $t.Current;
                        if (l.Type === 3) {
                            if (l.Brightness >= 100) {
                                l.BrightDown = true;
                            } else if (l.Brightness <= 0) {
                                l.BrightDown = false;
                            }

                            if (l.BrightDown) {
                                l.Brightness = (l.Brightness - 1) | 0;
                            } else {
                                l.Brightness = (l.Brightness + 1) | 0;
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
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
                this._projectiles.add(($t = new _2D_Test_Game.Projectiles.Rifleshot(), $t.Direction = Bridge.Int.clip32(this._player.DirectionDegrees), $t.X = Bridge.Int.clip32(((this._player.X + (((Bridge.Int.div(_2D_Test_Game.Player.Width, 2)) | 0))) | 0) + ((_2D_Test_Game.Player.Width * 1.5) * Math.cos(this._player.DirectionDegrees / (57.295779513082323)))), $t.Y = Bridge.Int.clip32(((this._player.Y + (((Bridge.Int.div(_2D_Test_Game.Player.Height, 2)) | 0))) | 0) + ((_2D_Test_Game.Player.Width * 1.5) * Math.sin(this._player.DirectionDegrees / (57.295779513082323)))), $t));
            },
            MoveProjectiles: function (ms) {
                for (var i = (this._projectiles.Count - 1) | 0; i >= 0; i = (i - 1) | 0) {
                    var projectile = this._projectiles.getItem(i);

                    projectile.Move(ms);
                    if (projectile.X < 0 || projectile.Y < 0 || projectile.X > (Bridge.Int.mul(System.Array.getLength(this._worldBlocks, 1), _2D_Test_Game.Blocks.Block.BlockSizeX)) || projectile.Y > (Bridge.Int.mul(System.Array.getLength(this._worldBlocks, 0), _2D_Test_Game.Blocks.Block.BlockSizeY))) {
                        this._projectiles.removeAt(i);
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
                this.Speed = 3072;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIyRF9UZXN0X0dhbWUuanMiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbIkJsb2Nrcy9CbG9jay5jcyIsIkRlYnVnSW5mby5jcyIsIkdhbWUuY3MiLCJMaWdodC5jcyIsIlBsYXllci5jcyIsIlByb2plY3RpbGVzL1Byb2plY3RpbGUuY3MiLCJXb3JsZC5jcyIsIkJsb2Nrcy9EaXJ0LmNzIiwiQmxvY2tzL0VtcHR5LmNzIiwiQmxvY2tzL0dyYXNzLmNzIiwiQmxvY2tzL1N0b25lLmNzIiwiUHJvamVjdGlsZXMvUmlmbGVzaG90LmNzIl0sCiAgIm5hbWVzIjogWyIiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozt3QkFtQlFBLE9BQU9BLElBQUlBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkNJUEEseUJBQWtCQSxZQUFZQSx3Q0FBZ0JBO29CQUM5Q0EseUJBQWtCQSxhQUFhQSx5Q0FBaUJBO29CQUNoREEseUJBQWtCQSxnQkFBZ0JBLDJDQUFtQkE7Ozs7Ozs7OztZQ1ZyREEsVUFBVUE7WUFDVkEsMEJBQTBCQTtZQUMxQkEsV0FBV0EsSUFBSUEsbUJBQUtBO1lBQ3BCQSxxREFBbUJBLFVBQUNBO2dCQUVoQkE7O1lBRUpBLHVEQUFvQkEsVUFBQ0E7Z0JBRWpCQSxjQUFjQTs7WUFFbEJBLG1EQUFrQkEsVUFBQ0E7Z0JBRWZBLGdCQUFnQkE7O1lBRXBCQSwyREFBc0JBLFVBQUNBO2dCQUVuQkEsaUJBQWlCQSxZQUFZQTs7WUFFakNBLDJEQUFzQkEsVUFBQ0E7Z0JBRW5CQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQTtvQkFFZkEsY0FBY0E7OztZQUd0QkEsdURBQW9CQSxVQUFDQTtnQkFFakJBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBO29CQUVmQSxnQkFBZ0JBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzZCQWdCRkEsS0FBSUE7a0NBdUdBQTs7NEJBbEdsQkE7OztnQkFFUkEsbUJBQWNBO2dCQUNk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QkFFL0RBOztnQkFFQUEsaUJBQWlCQSxHQUFHQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxuXHJcbm5hbWVzcGFjZSBfMkRfVGVzdF9HYW1lLkJsb2Nrc1xyXG57XHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgY2xhc3MgQmxvY2tcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBCbG9ja1NpemVYID0zMjtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBCbG9ja1NpemVZID0gMzI7XHJcblxyXG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBib29sIFdhbGthbGJsZSB7IGdldDsgfVxyXG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCB2b2lkIERyYXcoQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIGNudiwgaW50IHgsIGludCB5KTtcclxucHVibGljIHN0YXRpYyBCbG9jayBFbXB0eUJsb2NrXHJcbntcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBuZXcgRW1wdHkoKTtcclxuICAgIH1cclxufSAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIF8yRF9UZXN0X0dhbWVcclxue1xyXG4gICAgcHVibGljIHN0YXRpYyBjbGFzcyBEZWJ1Z0luZm9cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBQbGF5ZXJYIHsgc2V0OyBnZXQ7IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBQbGF5ZXJZIHsgc2V0OyBnZXQ7IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBEcmF3WCB7IHNldDsgZ2V0OyB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgRHJhd1kgeyBzZXQ7IGdldDsgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IE1hcFggeyBzZXQ7IGdldDsgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IE1hcFkgeyBzZXQ7IGdldDsgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZG91YmxlIE1zUGVyRHJhdyB7IHNldDsgZ2V0OyB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgRHJhd1dpZHRoIHsgc2V0OyBnZXQ7IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBEcmF3SGVpZ2h0IHsgc2V0OyBnZXQ7IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBQbGF5ZXJMb29rRGVnIHsgc2V0O2dldDsgfVxyXG5cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIExvZygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShcIk1hcCBYOiBcIiArIE1hcFggKyBcIiBZOiBcIiArIE1hcFkpO1xyXG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShcIkRyYXcgWDogXCIgKyBEcmF3WCArIFwiIFk6IFwiICsgRHJhd1kpO1xyXG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShcIlBsYXllciAtIFg6XCIgKyBQbGF5ZXJYICsgXCIgWTogXCIgKyBQbGF5ZXJZKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG5cclxubmFtZXNwYWNlIF8yRF9UZXN0X0dhbWVcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEdhbWVcclxuICAgIHtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBpbnQgVGlja1JhdGUgPSAxMDA7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBNYWluKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBjbnYgPSBuZXcgSFRNTENhbnZhc0VsZW1lbnQoKTtcclxuICAgICAgICAgICAgRG9jdW1lbnQuQm9keS5BcHBlbmRDaGlsZChjbnYpO1xyXG4gICAgICAgICAgICB2YXIgZ2FtZSA9IG5ldyBHYW1lKGNudik7XHJcbiAgICAgICAgICAgIFdpbmRvdy5PblJlc2l6ZSArPSAoZXYpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGdhbWUuUmVzaXplKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIFdpbmRvdy5PbktleURvd24gKz0gKEtleWJvYXJkRXZlbnQgZXYpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGdhbWUuUHJlc3NLZXkoZXYuS2V5Q29kZSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIFdpbmRvdy5PbktleVVwICs9IChLZXlib2FyZEV2ZW50IGV2KSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnYW1lLlJlbGVhc2VLZXkoZXYuS2V5Q29kZSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIFdpbmRvdy5Pbk1vdXNlTW92ZSArPSAoTW91c2VFdmVudCBldikgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZ2FtZS5TZXRNb3VzZVBvcyhldi5DbGllbnRYLCBldi5DbGllbnRZKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgV2luZG93Lk9uTW91c2VEb3duICs9IChNb3VzZUV2ZW50IGV2KSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGV2LkJ1dHRvbnMgJiAoMSA8PCAwKSkgPT0gMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBnYW1lLlByZXNzS2V5KC0xKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgV2luZG93Lk9uTW91c2VVcCArPSAoTW91c2VFdmVudCBldikgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKChldi5CdXR0b25zICYgKDEgPDwgMCkpID09IDApXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2FtZS5SZWxlYXNlS2V5KC0xKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHJpdmF0ZSBIVE1MQ2FudmFzRWxlbWVudCBfbWFpbkNhbnZhcztcclxuICAgICAgICBwcml2YXRlIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCBfbWFpbkNhbnZhc1JlbmRlcmVyO1xyXG5cclxuICAgICAgICBwcml2YXRlIEJyaWRnZS5IdG1sNS5IVE1MQ2FudmFzRWxlbWVudCBfc2hhZG93Q2FudmFzO1xyXG4gICAgICAgIHByaXZhdGUgQnJpZGdlLkh0bWw1LkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCBfc2hhZG93Q2FudmFzMkQ7XHJcblxyXG4gICAgICAgIHByaXZhdGUgRGF0ZVRpbWUgX2xhc3REcmF3O1xyXG5cclxuICAgICAgICBwcml2YXRlIFdvcmxkIF93b3JsZDtcclxuICAgICAgICBwcml2YXRlIFBsYXllciBfcGxheWVyO1xyXG5cclxuICAgICAgICBwcml2YXRlIExpc3Q8aW50PiBfa2V5cyA9IG5ldyBMaXN0PGludD4oKTtcclxuICAgICAgICBwcml2YXRlIGludCBfbW91c2VYO1xyXG4gICAgICAgIHByaXZhdGUgaW50IF9tb3VzZVk7XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBHYW1lKEhUTUxDYW52YXNFbGVtZW50IGNhbnZhcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIF9tYWluQ2FudmFzID0gY2FudmFzO1xyXG4gICAgICAgICAgICBfbWFpbkNhbnZhc1JlbmRlcmVyID0gX21haW5DYW52YXMuR2V0Q29udGV4dChDYW52YXNUeXBlcy5DYW52YXNDb250ZXh0MkRUeXBlLkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk7XHJcblxyXG4gICAgICAgICAgICBfc2hhZG93Q2FudmFzID0gbmV3IEJyaWRnZS5IdG1sNS5IVE1MQ2FudmFzRWxlbWVudCgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFdpZHRoID0gX21haW5DYW52YXMuV2lkdGgsXHJcbiAgICAgICAgICAgICAgICBIZWlnaHQgPSBfbWFpbkNhbnZhcy5IZWlnaHRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgX3NoYWRvd0NhbnZhczJEID0gX3NoYWRvd0NhbnZhcy5HZXRDb250ZXh0KEJyaWRnZS5IdG1sNS5DYW52YXNUeXBlcy5DYW52YXNDb250ZXh0MkRUeXBlLkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk7XHJcbiAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgUmVzaXplKCk7XHJcblxyXG4gICAgICAgICAgICBfcGxheWVyID0gbmV3IFBsYXllcigpO1xyXG5cclxuICAgICAgICAgICAgX2xhc3REcmF3ID0gRGF0ZVRpbWUuTm93O1xyXG5cclxuICAgICAgICAgICAgX3dvcmxkID0gbmV3IFdvcmxkKF9wbGF5ZXIsIFwibWFwMS5qc29uXCIpO1xyXG4gICAgICAgICAgICBfd29ybGQuTG9hZGVkICs9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIFdpbmRvdy5TZXRUaW1lb3V0KChBY3Rpb24pR2FtZVRpY2ssMTAwMCAvIFRpY2tSYXRlKTtcclxuICAgICAgICAgICAgICAgIFdpbmRvdy5SZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKEFjdGlvbilHYW1lRnJhbWUpO1xyXG4gICAgICAgICAgICAgICAgX3BsYXllci5YID0gNTAwO1xyXG4gICAgICAgICAgICAgICAgX3BsYXllci5ZID0gNTAwO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFByZXNzS2V5KGludCBrZXlDb2RlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCFfa2V5cy5Db250YWlucyhrZXlDb2RlKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgX2tleXMuQWRkKGtleUNvZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlbGVhc2VLZXkoaW50IGtleUNvZGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBfa2V5cy5SZW1vdmUoa2V5Q29kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBTZXRNb3VzZVBvcyhpbnQgeCwgaW50IHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBfbW91c2VYID0geCA7XHJcbiAgICAgICAgICAgIF9tb3VzZVkgPSB5O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFJlc2l6ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBfbWFpbkNhbnZhcy5XaWR0aCA9IFdpbmRvdy5Eb2N1bWVudC5Cb2R5LkNsaWVudFdpZHRoO1xyXG4gICAgICAgICAgICBfbWFpbkNhbnZhcy5IZWlnaHQgPSBXaW5kb3cuRG9jdW1lbnQuQm9keS5DbGllbnRIZWlnaHQgLSA4O1xyXG4gICAgICAgICAgICBfc2hhZG93Q2FudmFzLldpZHRoID0gV2luZG93LkRvY3VtZW50LkJvZHkuQ2xpZW50V2lkdGg7XHJcbiAgICAgICAgICAgIF9zaGFkb3dDYW52YXMuSGVpZ2h0ID0gV2luZG93LkRvY3VtZW50LkJvZHkuQ2xpZW50SGVpZ2h0IC0gODtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgR2FtZVRpY2soKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgSGFuZGxlTW92ZW1lbnQoMTAwMCAvIFRpY2tSYXRlKTtcclxuXHJcbiAgICAgICAgICAgIF93b3JsZC5Nb3ZlUHJvamVjdGlsZXMoMTAwMCAvIFRpY2tSYXRlKTtcclxuICAgICAgICAgICAgV2luZG93LlNldFRpbWVvdXQoKEFjdGlvbilHYW1lVGljaywgMTAwMCAvIFRpY2tSYXRlKTtcclxuICAgICAgICAgICAgX3dvcmxkLkFuaW1hdGVMaWdodCgpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBHYW1lRnJhbWUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX3dvcmxkLkRyYXcoX21haW5DYW52YXNSZW5kZXJlciwgX3NoYWRvd0NhbnZhczJELCAgX21haW5DYW52YXMuV2lkdGgsIF9tYWluQ2FudmFzLkhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgRGVidWdJbmZvLk1zUGVyRHJhdyA9ICAoKERhdGVUaW1lLk5vdyAtIF9sYXN0RHJhdykuVG90YWxNaWxsaXNlY29uZHMpO1xyXG4gICAgICAgICAgICBfbGFzdERyYXcgPSBEYXRlVGltZS5Ob3c7XHJcblxyXG5cclxuICAgICAgICAgICAgRHJhd0RlYnVnSW5mbygpO1xyXG5cclxuICAgICAgICAgICAgLy9XaW5kb3cuUmVxdWVzdEFuaW1hdGlvbkZyYW1lKEdhbWVGcmFtZSk7XHJcbiAgICAgICAgICAgIFdpbmRvdy5TZXRUaW1lb3V0KChBY3Rpb24pR2FtZUZyYW1lLCAwKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgRHJhd0RlYnVnSW5mbygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBfbWFpbkNhbnZhc1JlbmRlcmVyLkZpbGxTdHlsZSA9IFwid2hpdGVcIjtcclxuICAgICAgICAgICAgX21haW5DYW52YXNSZW5kZXJlci5Gb250ID0gXCIxNnB4IEFyaWFsXCI7XHJcblxyXG4gICAgICAgICAgICBfbWFpbkNhbnZhc1JlbmRlcmVyLkZpbGxUZXh0KFwiRlBTOiBcIiArICggKGludCkoMTAwMCAvIERlYnVnSW5mby5Nc1BlckRyYXcpICkuVG9TdHJpbmcoKSwgMCwgMTgpO1xyXG4gICAgICAgICAgICBfbWFpbkNhbnZhc1JlbmRlcmVyLkZpbGxUZXh0KFwiUGxheWVyIFg6IFwiICsgRGVidWdJbmZvLlBsYXllclggKyBcIiBZOiBcIiArIERlYnVnSW5mby5QbGF5ZXJZICsgXCIgVjogXCIgKyBEZWJ1Z0luZm8uUGxheWVyTG9va0RlZywgMCwgMzYpO1xyXG4gICAgICAgICAgICBfbWFpbkNhbnZhc1JlbmRlcmVyLkZpbGxUZXh0KFwiTWFwIFg6IFwiICsgRGVidWdJbmZvLk1hcFggKyBcIiBZOiBcIiArIERlYnVnSW5mby5NYXBZLCAwLCA1NCk7XHJcbiAgICAgICAgICAgIF9tYWluQ2FudmFzUmVuZGVyZXIuRmlsbFRleHQoXCJEcmF3IFg6IFwiICsgRGVidWdJbmZvLkRyYXdYICsgXCIgWTogXCIgKyBEZWJ1Z0luZm8uRHJhd1ksIDAgLCA3Mik7XHJcbiAgICAgICAgICAgIF9tYWluQ2FudmFzUmVuZGVyZXIuRmlsbFRleHQoXCJTY3JlZW4gVzogXCIgK0RlYnVnSW5mby5EcmF3V2lkdGggKyBcIiBIOiBcIiArIERlYnVnSW5mby5EcmF3SGVpZ2h0LCAwLCA5MCk7XHJcbiAgICAgICAgICAgIF9tYWluQ2FudmFzUmVuZGVyZXIuRmlsbFRleHQoXCJNb3VzZSBYOiBcIiArIF9tb3VzZVggKyBcIiBZOiBcIiArIF9tb3VzZVksIDAsIDEwOCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHByaXZhdGUgRGF0ZVRpbWUgX25leHRTaG9vdCA9IERhdGVUaW1lLk5vdztcclxuICAgICAgICBwcml2YXRlIHZvaWQgSGFuZGxlTW92ZW1lbnQoZG91YmxlIG1zKVxyXG4gICAgICAgIHtcclxuXHJcblxyXG4gICAgICAgICAgICBpbnQgY2VudGVyWSA9IChfbWFpbkNhbnZhcy5IZWlnaHQgLyAyKSArIChQbGF5ZXIuSGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgIGludCBjZW50ZXJYID0gKF9tYWluQ2FudmFzLldpZHRoIC8gMikgKyAoUGxheWVyLldpZHRoIC8gMik7XHJcblxyXG5cclxuICAgICAgICAgICAgdmFyIGZvbyA9IE1hdGguQXRhbjIoY2VudGVyWSAtIF9tb3VzZVksIGNlbnRlclggLSBfbW91c2VYKTtcclxuXHJcblxyXG4gICAgICAgICAgICBmb28gPSBmb28gKiAxODAgLyBNYXRoLlBJO1xyXG4gICAgICAgICAgICBmb28gKz0gMTgwO1xyXG5cclxuICAgICAgICAgICAgX3BsYXllci5EaXJlY3Rpb25EZWdyZWVzID0gZm9vO1xyXG4gICAgICAgICAgICBEZWJ1Z0luZm8uUGxheWVyTG9va0RlZyA9IChpbnQpX3BsYXllci5EaXJlY3Rpb25EZWdyZWVzO1xyXG5cclxuICAgICAgICAgICAgZG91YmxlIG12bnQgPSBtcy8gMTAwMDtcclxuXHJcbiAgICAgICAgICAgIGRvdWJsZSBtdm1udFg9IDAgLCBtdm1udFkgPSAwO1xyXG4gICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKHZhciBrZXkgaW4gX2tleXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vd1xyXG4gICAgICAgICAgICAgICAgaWYgKGtleSA9PSA4NylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtdm1udFkgLT0gKFBsYXllci5TcGVlZCAqIG12bnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9hXHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChrZXkgPT0gNjUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbXZtbnRYIC09IChQbGF5ZXIuU3BlZWQgKiBtdm50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vc1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09IDgzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG12bW50WSArPSAoUGxheWVyLlNwZWVkICogbXZudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL2RcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PSA2OClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtdm1udFggKz0gKFBsYXllci5TcGVlZCAqIG12bnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZihrZXkgPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoX25leHRTaG9vdCA8PSBEYXRlVGltZS5Ob3cpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfd29ybGQuU2hvb3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX25leHRTaG9vdCA9IERhdGVUaW1lLk5vdy5BZGRNaWxsaXNlY29uZHMoMTAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3dvcmxkLk1vdmVQbGF5ZXIobXZtbnRYLCBtdm1udFkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuXHJcblxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxuXHJcbm5hbWVzcGFjZSBfMkRfVGVzdF9HYW1lXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBMaWdodFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgWCB7IHNldDsgZ2V0OyB9XHJcbiAgICAgICAgcHVibGljIGludCBZIHsgc2V0OyBnZXQ7IH1cclxuICAgICAgICBwdWJsaWMgaW50IFR5cGUgeyBzZXQ7IGdldDsgfVxyXG4gICAgICAgIHB1YmxpYyBpbnQgQnJpZ2h0bmVzcyB7IHNldDsgZ2V0OyB9XHJcbiAgICAgICAgcHVibGljIGJvb2wgQnJpZ2h0RG93biB7IHNldDsgZ2V0OyB9XHJcbiAgICAgICAgcHVibGljIExpZ2h0KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFggPSAwO1xyXG4gICAgICAgICAgICBZID0gMDtcclxuICAgICAgICAgICAgVHlwZSA9IDA7XHJcbiAgICAgICAgICAgIEJyaWdodG5lc3MgPSAxMDA7XHJcbiAgICAgICAgICAgIEJyaWdodERvd24gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgXzJEX1Rlc3RfR2FtZVxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgUGxheWVyXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBzdHJpbmcgUGxheWVyR3JhcGhpY3MgPSBcImltZy9sYXJkX2tvcGZfdHJhbnNwYXJlbnQucG5nXCI7XHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBzdHJpbmcgV2VhcG9uR3JhcGhpY3MgPSBcImltZy9tNC5wbmdcIjtcclxuICAgICAgICBwcml2YXRlIEhUTUxJbWFnZUVsZW1lbnQgX2ltZ1BsYXllcjtcclxuICAgICAgICBwcml2YXRlIEhUTUxJbWFnZUVsZW1lbnQgX2ltZ1dlYXBvbjtcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbnQgV2lkdGggPSAzMjtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGludCBIZWlnaHQgPSA0ODtcclxuICAgICAgICBwdWJsaWMgY29uc3QgZmxvYXQgU3BlZWQgPSA3Njg7XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgWCB7IHNldDsgZ2V0OyB9XHJcbiAgICAgICAgcHVibGljIGludCBZIHsgc2V0OyBnZXQ7IH1cclxuXHJcbiAgICAgICAgcHVibGljIGRvdWJsZSBEaXJlY3Rpb25EZWdyZWVzIHsgc2V0OyBnZXQ7IH1cclxuXHJcblxyXG4gICAgICAgIHB1YmxpYyBQbGF5ZXIoKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIF9pbWdQbGF5ZXIgPSBuZXcgSFRNTEltYWdlRWxlbWVudCgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNyYyA9IFBsYXllckdyYXBoaWNzXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIF9pbWdXZWFwb24gPSBuZXcgSFRNTEltYWdlRWxlbWVudCgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNyYyA9IFdlYXBvbkdyYXBoaWNzXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBEcmF3KENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCBjbnYsIGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNudi5EcmF3SW1hZ2UoX2ltZ1BsYXllciwgMCwgMCwgX2ltZ1BsYXllci5XaWR0aCwgX2ltZ1BsYXllci5IZWlnaHQsIHgsIHksICBXaWR0aCwgSGVpZ2h0KTtcclxuICAgICAgICAgICAgLy9jbnYuU3Ryb2tlUmVjdCh4LCB5LCBXaWR0aCwgSGVpZ2h0KTtcclxuICAgICAgICAgICAgY252LlNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIG1vdmUgdG8gdGhlIGNlbnRlciBvZiB0aGUgY2FudmFzXHJcbiAgICAgICAgICAgIGNudi5UcmFuc2xhdGUoeCArIChQbGF5ZXIuV2lkdGggIC8gMiksIHkgKyAoUGxheWVyLkhlaWdodCAvIDIpKTtcclxuICAgICAgICAgICAgLy9jbnYuRmlsbFJlY3QoMCwgMCwgMjAsIDIwKTtcclxuICAgICAgICAgICAgY252LlJvdGF0ZSgoZG91YmxlKURpcmVjdGlvbkRlZ3JlZXMgLyAoMTgwIC9NYXRoLlBJKSk7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNudi5EcmF3SW1hZ2UoX2ltZ1dlYXBvbiwgMCwwLCBfaW1nV2VhcG9uLldpZHRoLCBfaW1nV2VhcG9uLkhlaWdodCwgMCAgLC01LCBXaWR0aCAqMS41LCBIZWlnaHQgLyAyKTsgICAgICAgICAgICBcclxuICAgICAgICAgICAgY252LlJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcblxuXHJcbiAgICBcbnByaXZhdGUgaW50IF9fUHJvcGVydHlfX0luaXRpYWxpemVyX19YPTMyO3ByaXZhdGUgaW50IF9fUHJvcGVydHlfX0luaXRpYWxpemVyX19ZPTMyO3ByaXZhdGUgZG91YmxlIF9fUHJvcGVydHlfX0luaXRpYWxpemVyX19EaXJlY3Rpb25EZWdyZWVzPTA7fVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG5cclxubmFtZXNwYWNlIF8yRF9UZXN0X0dhbWUuUHJvamVjdGlsZXNcclxue1xyXG4gICAgcHVibGljIGFic3RyYWN0IGNsYXNzIFByb2plY3RpbGVcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgaW50IFggeyBzZXQ7IGdldDsgfVxyXG4gICAgICAgIHB1YmxpYyBpbnQgWSB7IHNldDsgZ2V0OyB9XHJcbiAgICAgICAgcHVibGljIGFic3RyYWN0IGRvdWJsZSBTcGVlZCB7IHNldDsgZ2V0OyB9XHJcbiAgICAgICAgcHVibGljIGludCBEaXJlY3Rpb24geyBzZXQ7IGdldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBNb3ZlIChkb3VibGUgbXMpXHJcbiAgICAgICAge1xyXG5cclxuXHJcbiAgICAgICAgICAgIFggKz0gKGludCkgICgoU3BlZWQgKiAoIG1zIC8gMTAwMCApICsgMC41KSAqIE1hdGguQ29zKERpcmVjdGlvbiAvICgxODAgLyBNYXRoLlBJKSkpO1xyXG4gICAgICAgICAgICBZICs9IChpbnQpICAoKFNwZWVkICogKCBtcyAvIDEwMDAgKSArIDAuNSkgKiBNYXRoLlNpbihEaXJlY3Rpb24gLyAoMTgwIC8gTWF0aC5QSSkpKTtcclxuXHJcbiAgICAgICAgICAgIC8vWCArPSAoaW50KSgoU3BlZWQgKiAoIDEwMDAgL21zICkpICogTWF0aC5Db3MoRGlyZWN0aW9uKSArIDAuNSk7XHJcbiAgICAgICAgICAgIC8vWSArPSAoaW50KSgoU3BlZWQgKiAoIDEwMDAvIG1zICkpICogTWF0aC5TaW4oRGlyZWN0aW9uKSArIDAuNSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGFic3RyYWN0IHZvaWQgRHJhdyhDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgY29udGV4dCwgaW50IHN0YXJ0WCwgaW50IHN0YXJ0WSk7XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG5cclxubmFtZXNwYWNlIF8yRF9UZXN0X0dhbWVcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFdvcmxkXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIFdvcmxkKFBsYXllciBwbGF5ZXIsIHN0cmluZyBmaWxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX3BsYXllciA9IHBsYXllcjtcclxuICAgICAgICAgICAgTG9hZE1hcChmaWxlKTtcclxuICAgICAgICAgICAgX2ltZyA9IG5ldyBCcmlkZ2UuSHRtbDUuSFRNTEltYWdlRWxlbWVudCgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNyYyA9IFwiaW1nL2JhY2tnci5wbmdcIlxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIEFjdGlvbiBMb2FkZWQ7XHJcblxyXG4gICAgICAgIHByaXZhdGUgQmxvY2tzLkJsb2NrWyxdIF93b3JsZEJsb2NrcztcclxuICAgICAgICBwcml2YXRlIExpc3Q8TGlnaHQ+IF9saWdodHMgPSBuZXcgTGlzdDxMaWdodD4oKTsgXHJcblxyXG4gICAgICAgIHByaXZhdGUgTGlzdDxQcm9qZWN0aWxlcy5Qcm9qZWN0aWxlPiBfcHJvamVjdGlsZXMgPSBuZXcgTGlzdDxQcm9qZWN0aWxlcy5Qcm9qZWN0aWxlPigpO1xyXG4gICAgICAgIHB1YmxpYyBQbGF5ZXIgX3BsYXllcjtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBCcmlkZ2UuSHRtbDUuSFRNTEltYWdlRWxlbWVudCBfaW1nO1xyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgTG9hZE1hcChzdHJpbmcgZmlsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBqc29uID0gQnJpZGdlLmpRdWVyeTIualF1ZXJ5LkdldEpTT04oZmlsZSwgbnVsbCwgbmV3IEFjdGlvbjxvYmplY3Q+KChkYXRhKSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvL2ludFssXSBtYXAgPSBCcmlkZ2UuSHRtbDUuSlNPTi5QYXJzZTxpbnRbLF0+KGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgLy9pbnRbLF0gbWFwID0gKGludFssXSlkYXRhO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB2YXIgZERhdGEgPSBkYXRhLlRvRHluYW1pYygpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpbnQgdyA9IDAsIGggPTA7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChpbnRbXSByIGluIGREYXRhW1wiYmxvY2tzXCJdKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGggPT0wKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yZWFjaCAoaW50IGJsIGluIHIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHcrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBoKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBfd29ybGRCbG9ja3MgPSBuZXcgQmxvY2tzLkJsb2NrW2gsIHddO1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBpID0gMCwgaiA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChpbnRbXSByIGluIGREYXRhW1wiYmxvY2tzXCJdKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGogPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcmVhY2ggKGludCBibCBpbiByKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChibClcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAoMCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3dvcmxkQmxvY2tzW2ksIGpdID0gbmV3IEJsb2Nrcy5FbXB0eSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAoMSk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3dvcmxkQmxvY2tzW2ksIGpdID0gbmV3IEJsb2Nrcy5TdG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAoMik6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3dvcmxkQmxvY2tzW2ksIGpdID0gbmV3IEJsb2Nrcy5HcmFzcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAoMyk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3dvcmxkQmxvY2tzW2ksIGpdID0gbmV3IEJsb2Nrcy5EaXJ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF93b3JsZEJsb2Nrc1tpLCBqXSA9IG5ldyBCbG9ja3MuRW1wdHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBqKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChpbnRbXSBsIGluIGREYXRhW1wibGlnaHRzXCJdKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIF9saWdodHMuQWRkKG5ldyBMaWdodCgpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUeXBlID0gbFswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgWCA9IGxbMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFkgPSBsWzJdXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIExvYWRlZCgpO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAvL3ByaXZhdGUgdm9pZCBCdWlsZERlbW9Xb3JsZCgpXHJcbiAgICAgICAgLy97XHJcbiAgICAgICAgLy8gICAgX3dvcmxkQmxvY2tzID0gbmV3IEJsb2Nrcy5CbG9ja1s2NCw2NF07XHJcblxyXG4gICAgICAgIC8vICAgIGZvciAoaW50IGkgPSAwOyBpIDwgX3dvcmxkQmxvY2tzLkdldExlbmd0aCgwKTsgaSsrKVxyXG4gICAgICAgIC8vICAgIHtcclxuICAgICAgICAvLyAgICAgICAgZm9yIChpbnQgaiA9IDA7IGogPCBfd29ybGRCbG9ja3MuR2V0TGVuZ3RoKDEpOyBqKyspXHJcbiAgICAgICAgLy8gICAgICAgIHtcclxuICAgICAgICAvLyAgICAgICAgICAgIGlmKGkgPT0gMHx8IGogPT0gMHx8IGkgPT0gX3dvcmxkQmxvY2tzLkdldExlbmd0aCgwKSAtIDF8fCBqID09IF93b3JsZEJsb2Nrcy5HZXRMZW5ndGgoMSkgLSAxKVxyXG4gICAgICAgIC8vICAgICAgICAgICAge1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgIF93b3JsZEJsb2Nrc1tpLCBqXSA9IG5ldyBCbG9ja3MuU3RvbmUoKTtcclxuICAgICAgICAvLyAgICAgICAgICAgIH1cclxuICAgICAgICAvLyAgICAgICAgICAgIGVsc2UgaWYgKGkgPT0gMiB8fCBqID09IDIgfHwgaSA9PSBfd29ybGRCbG9ja3MuR2V0TGVuZ3RoKDApIC0gMiB8fCBqID09IF93b3JsZEJsb2Nrcy5HZXRMZW5ndGgoMSkgLSAyKVxyXG4gICAgICAgIC8vICAgICAgICAgICAge1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgIF93b3JsZEJsb2Nrc1tpLCBqXSA9IG5ldyBCbG9ja3MuRGlydCgpO1xyXG4gICAgICAgIC8vICAgICAgICAgICAgfVxyXG4gICAgICAgIC8vICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgIC8vICAgICAgICAgICAge1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgIF93b3JsZEJsb2Nrc1tpLCBqXSA9IG5ldyBCbG9ja3MuR3Jhc3MoKTtcclxuICAgICAgICAvLyAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAvLyAgICAgICAgfVxyXG4gICAgICAgIC8vICAgIH1cclxuICAgICAgICAvL31cclxuICAgICAgICBcclxuICAgICAgICBwcml2YXRlIEJsb2Nrcy5CbG9jayBHZXRCbG9ja0F0WFkoaW50IHgsIGludCB5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHggPCAwIHx8IHkgPCAwKSByZXR1cm4gQmxvY2tzLkJsb2NrLkVtcHR5QmxvY2s7XHJcbiAgICAgICAgICAgIGlmICh4ID49IF93b3JsZEJsb2Nrcy5HZXRMZW5ndGgoMSkgKiBCbG9ja3MuQmxvY2suQmxvY2tTaXplWCB8fCB5ID49IF93b3JsZEJsb2Nrcy5HZXRMZW5ndGgoMCkgKiBCbG9ja3MuQmxvY2suQmxvY2tTaXplWSkgcmV0dXJuIEJsb2Nrcy5CbG9jay5FbXB0eUJsb2NrO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIF93b3JsZEJsb2Nrc1t5IC8gQmxvY2tzLkJsb2NrLkJsb2NrU2l6ZVksIHggLyBCbG9ja3MuQmxvY2suQmxvY2tTaXplWF07ICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgRHJhdyhCcmlkZ2UuSHRtbDUuQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIGNhbnZhcywgQnJpZGdlLkh0bWw1LkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCBzaGFkb3dDb250ZXh0LCBpbnQgd2lkdGgsIGludCBoZWlnaHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvL2RyYXcgYmxhY2sgYmdcclxuICAgICAgICAgICAgLy9jYW52YXMuRmlsbFN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgICAgICAvL2NhbnZhcy5GaWxsUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgY2FudmFzLkRyYXdJbWFnZShfaW1nLCAwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIC8vZHJhdyB3b3JsZFxyXG4gICAgICAgICAgICBpbnQgbWFwUG9zWCwgbWFwUG9zWTtcclxuICAgICAgICAgICAgaW50IGRyYXdQb3NYID0gMCwgZHJhd1Bvc1kgPSAwO1xyXG5cclxuICAgICAgICAgICAgbWFwUG9zWCA9IF9wbGF5ZXIuWCAtICh3aWR0aCAvIDIpO1xyXG4gICAgICAgICAgICBtYXBQb3NZID0gX3BsYXllci5ZIC0gKGhlaWdodCAvIDIpO1xyXG5cclxuICAgICAgICAgICAgaWYobWFwUG9zWCA8IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRyYXdQb3NYID0gLW1hcFBvc1g7XHJcbiAgICAgICAgICAgICAgICBtYXBQb3NYID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihtYXBQb3NZIDwgMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZHJhd1Bvc1kgPSAtbWFwUG9zWTtcclxuICAgICAgICAgICAgICAgIG1hcFBvc1kgPSAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgRGVidWdJbmZvLkRyYXdYID0gZHJhd1Bvc1g7XHJcbiAgICAgICAgICAgIERlYnVnSW5mby5EcmF3WSA9IGRyYXdQb3NZO1xyXG4gICAgICAgICAgICBEZWJ1Z0luZm8uTWFwWCA9IG1hcFBvc1g7XHJcbiAgICAgICAgICAgIERlYnVnSW5mby5NYXBZID0gbWFwUG9zWTtcclxuICAgICAgICAgICAgRGVidWdJbmZvLlBsYXllclggPSBfcGxheWVyLlg7XHJcbiAgICAgICAgICAgIERlYnVnSW5mby5QbGF5ZXJZID0gX3BsYXllci5ZO1xyXG4gICAgICAgICAgICBEZWJ1Z0luZm8uRHJhd0hlaWdodCA9IGhlaWdodDtcclxuICAgICAgICAgICAgRGVidWdJbmZvLkRyYXdXaWR0aCA9IHdpZHRoO1xyXG5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgaW50IHRtcERyYXdYLCB0bXBNYXBYO1xyXG4gICAgICAgICAgICBpbnQgdG1wTWFwWSA9IG1hcFBvc1k7XHJcbiAgICAgICAgICAgIGludCB0bXBEcmF3WSA9IGRyYXdQb3NZO1xyXG5cclxuICAgICAgICAgICAgLy9nbyBkb3duIFkhIVxyXG4gICAgICAgICAgICB3aGlsZSAodG1wRHJhd1kgPCBoZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRtcERyYXdYID0gZHJhd1Bvc1g7XHJcbiAgICAgICAgICAgICAgICB0bXBNYXBYID0gbWFwUG9zWDtcclxuXHJcbiAgICAgICAgICAgICAgICAvL2dvIHJpZ2h0IFghISFcclxuICAgICAgICAgICAgICAgIHdoaWxlKHRtcERyYXdYIDwgd2lkdGgpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsb2NrID0gR2V0QmxvY2tBdFhZKHRtcE1hcFgsIHRtcE1hcFkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLkRyYXcoY2FudmFzLCB0bXBEcmF3WCAtIChtYXBQb3NYICUgQmxvY2tzLkJsb2NrLkJsb2NrU2l6ZVgpLCB0bXBEcmF3WSAtICh0bXBNYXBZICUgQmxvY2tzLkJsb2NrLkJsb2NrU2l6ZVkpKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRtcE1hcFggKz0gQmxvY2tzLkJsb2NrLkJsb2NrU2l6ZVg7XHJcbiAgICAgICAgICAgICAgICAgICAgdG1wRHJhd1ggKz0gQmxvY2tzLkJsb2NrLkJsb2NrU2l6ZVg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0bXBNYXBZICs9IEJsb2Nrcy5CbG9jay5CbG9ja1NpemVZO1xyXG4gICAgICAgICAgICAgICAgdG1wRHJhd1kgKz0gQmxvY2tzLkJsb2NrLkJsb2NrU2l6ZVk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIFxyXG5cclxuXHJcblxyXG5cclxuICAgICAgICAgICAgLypjdC5HbG9iYWxBbHBoYSA9IDAuNWY7XHJcbiAgICAgICAgICAgIGN0LkZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjMpXCI7XHJcbiAgICAgICAgICAgIGN0LkZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICBjdC5GaWxsU3R5bGUgPSBcInJnYmEoMjU1LDI1NSwyNTUsMC4zKVwiO1xyXG4gICAgICAgICAgICBjdC5CZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3QuQXJjKDI1MCwgMjUwLCAyMCwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgICAgICBjdC5GaWxsKCk7XHJcbiAgICAgICAgICAgIGN0Lkdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IEJyaWRnZS5IdG1sNS5DYW52YXNUeXBlcy5DYW52YXNDb21wb3NpdGVPcGVyYXRpb25UeXBlLkxpZ2h0ZW47XHJcbiAgICAgICAgICAgICovXHJcblxyXG4gICAgICAgICAgICAvL2NhbnZhcy5EcmF3SW1hZ2UoY3QuQ2FudmFzLCAwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgXHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vY2FudmFzLkNyZWF0ZVJhZGlhbEdyYWRpZW50KClcclxuXHJcblxyXG4gICAgICAgICAgICAvL2RyYXcgcHJvamVjdGlsZXNcclxuICAgICAgICAgICAgZm9yZWFjaCAodmFyIHByb2plY3RpbGUgaW4gX3Byb2plY3RpbGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBwcm9qZWN0aWxlLkRyYXcoY2FudmFzLCAgZHJhd1Bvc1ggKyBwcm9qZWN0aWxlLlggLSBtYXBQb3NYLCBkcmF3UG9zWSArICBwcm9qZWN0aWxlLlkgLSBtYXBQb3NZKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAvL2RyYXcgcGxheWVyXHJcbiAgICAgICAgICAgIF9wbGF5ZXIuRHJhdyhjYW52YXMsKHdpZHRoIC8gMiksIChoZWlnaHQgLyAyKSk7XHJcblxyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAvL3NoYWRvd0NvbnRleHQuQ2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICAvL3NoYWRvd0NvbnRleHQuQ2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICBzaGFkb3dDb250ZXh0Lkdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IEJyaWRnZS5IdG1sNS5DYW52YXNUeXBlcy5DYW52YXNDb21wb3NpdGVPcGVyYXRpb25UeXBlLlNvdXJjZU92ZXI7XHJcbiAgICAgICAgICAgIHNoYWRvd0NvbnRleHQuRmlsbFN0eWxlID0gXCIjMDAwXCI7XHJcbiAgICAgICAgICAgIHNoYWRvd0NvbnRleHQuRmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIHNoYWRvd0NvbnRleHQuR2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gQnJpZGdlLkh0bWw1LkNhbnZhc1R5cGVzLkNhbnZhc0NvbXBvc2l0ZU9wZXJhdGlvblR5cGUuRGVzdGluYXRpb25PdXQ7XHJcblxyXG4gICAgICAgICAgICBzaGFkb3dDb250ZXh0LkZpbGxTdHlsZSA9IFwicmdiKDAsMCwwLDAuMylcIjtcclxuICAgICAgICAgICAgc2hhZG93Q29udGV4dC5GaWxsUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgLy9jcmVhdGUgbGlnaHRzXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKHZhciBsaWdodCBpbiBfbGlnaHRzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgcmFkID0gMTAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxpZ2h0LlR5cGUgPT0gMilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByYWQgPSA1MDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgbEdyZCA9IHNoYWRvd0NvbnRleHQuQ3JlYXRlUmFkaWFsR3JhZGllbnQoZHJhd1Bvc1ggLSBtYXBQb3NYICsgbGlnaHQuWCwgZHJhd1Bvc1kgLSBtYXBQb3NZICsgbGlnaHQuWSwgMCwgZHJhd1Bvc1ggLSBtYXBQb3NYICsgbGlnaHQuWCwgZHJhd1Bvc1kgLSBtYXBQb3NZICsgbGlnaHQuWSwgcmFkKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsR3JkLkFkZENvbG9yU3RvcCgwLCBcInJnYmEoMjU1LDI1NSwyNTUsXCIgKyBNYXRoLlJvdW5kKCAoKGZsb2F0KWxpZ2h0LkJyaWdodG5lc3MgLyAxMDApLCAyKSsgXCIpXCIpO1xyXG4gICAgICAgICAgICAgICAgbEdyZC5BZGRDb2xvclN0b3AoMSwgXCJyZ2JhKDI1NSwyNTUsMjU1LDAuMClcIik7XHJcbiAgICAgICAgICAgICAgICBzaGFkb3dDb250ZXh0LkZpbGxTdHlsZSA9IGxHcmQ7XHJcbiAgICAgICAgICAgICAgICBzaGFkb3dDb250ZXh0LkZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgY2FudmFzLkRyYXdJbWFnZShzaGFkb3dDb250ZXh0LkNhbnZhcywgMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBBbmltYXRlTGlnaHQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yZWFjaCh2YXIgbCAgaW4gX2xpZ2h0cylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYobC5UeXBlID09IDMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobC5CcmlnaHRuZXNzID49IDEwMClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGwuQnJpZ2h0RG93biA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYobC5CcmlnaHRuZXNzIDw9IDApXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsLkJyaWdodERvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGwuQnJpZ2h0RG93bilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGwuQnJpZ2h0bmVzcy0tO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsLkJyaWdodG5lc3MrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIHZvaWQgTW92ZVBsYXllcihkb3VibGUgbXZYLCBkb3VibGUgbXZZKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGJsb2Nrc012dFggPSAoaW50KSgoX3BsYXllci5YICsgbXZYKSAvIEJsb2Nrcy5CbG9jay5CbG9ja1NpemVYKTtcclxuICAgICAgICAgICAgaW50IGJsb2Nrc012dFkgPSAoaW50KSgoX3BsYXllci5ZICsgbXZZKSAvIEJsb2Nrcy5CbG9jay5CbG9ja1NpemVZKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZihtdlggIT0gMCAmJiBtdlkgIT0gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbXZZID0gbXZZIC8gMS42O1xyXG4gICAgICAgICAgICAgICAgbXZYID0gbXZYIC8gMS42O1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgLy9tb3ZlIGxlZnRcclxuICAgICAgICAgICAgaWYobXZYIDwgMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHggPSAoaW50KShfcGxheWVyLlggKyBtdlggKyAwLjUpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJsayA9IEdldEJsb2NrQXRYWSh4LCBfcGxheWVyLlkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGJsay5XYWxrYWxibGUpIF9wbGF5ZXIuWCA9IHg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9tb3ZlIHJpZ2h0XHJcbiAgICAgICAgICAgIGVsc2UgaWYobXZYID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHggPSAoaW50KShfcGxheWVyLlggKyBtdlggKyAwLjUgKTtcclxuICAgICAgICAgICAgICAgIHZhciBibGsgPSBHZXRCbG9ja0F0WFkoeCArIFBsYXllci5XaWR0aCwgX3BsYXllci5ZKTtcclxuICAgICAgICAgICAgICAgIGlmIChibGsuV2Fsa2FsYmxlKSBfcGxheWVyLlggPSB4O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL21vdmUgdXBcclxuICAgICAgICAgICAgaWYgKG12WSA8IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCB5ID0gKGludCkoX3BsYXllci5ZICsgbXZZICsgMC41KTtcclxuICAgICAgICAgICAgICAgIHZhciBibGsgPSBHZXRCbG9ja0F0WFkoX3BsYXllci5YLCB5KTtcclxuICAgICAgICAgICAgICAgIGlmIChibGsuV2Fsa2FsYmxlKSBfcGxheWVyLlkgPSB5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vbW92ZSBkb3duXHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG12WSA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGludCB5ID0gKGludCkoX3BsYXllci5ZICsgbXZZICsgMC41ICk7XHJcbiAgICAgICAgICAgICAgICB2YXIgYmxrID0gR2V0QmxvY2tBdFhZKF9wbGF5ZXIuWCwgeSsgUGxheWVyLkhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYmxrLldhbGthbGJsZSkgX3BsYXllci5ZID0geTtcclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vZ2V0IGxlZnQgYmxvY2tcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBTaG9vdCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBfcHJvamVjdGlsZXMuQWRkKG5ldyBQcm9qZWN0aWxlcy5SaWZsZXNob3QoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBEaXJlY3Rpb24gPSAoaW50KSBfcGxheWVyLkRpcmVjdGlvbkRlZ3JlZXMsXHJcbiAgICAgICAgICAgICAgICBYID0gKGludCkoX3BsYXllci5YICsgKFBsYXllci5XaWR0aCAvIDIpICsgKChQbGF5ZXIuV2lkdGggKiAxLjUgKSogTWF0aC5Db3MoX3BsYXllci5EaXJlY3Rpb25EZWdyZWVzIC8gKDE4MCAvIE1hdGguUEkpKSkpLFxyXG4gICAgICAgICAgICAgICAgWSA9IChpbnQpKCBfcGxheWVyLlkgKyAoUGxheWVyLkhlaWdodCAvIDIpICsgKChQbGF5ZXIuV2lkdGggKiAxLjUpICogTWF0aC5TaW4oX3BsYXllci5EaXJlY3Rpb25EZWdyZWVzIC8gKDE4MCAvIE1hdGguUEkpKSkpLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIE1vdmVQcm9qZWN0aWxlcyhkb3VibGUgbXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gX3Byb2plY3RpbGVzLkNvdW50IC0xOyBpID49MCA7IGktLSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFyIHByb2plY3RpbGUgPSBfcHJvamVjdGlsZXNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgcHJvamVjdGlsZS5Nb3ZlKG1zKTtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0aWxlLlggPCAwIHx8IHByb2plY3RpbGUuWSA8IDAgfHwgcHJvamVjdGlsZS5YID4gKF93b3JsZEJsb2Nrcy5HZXRMZW5ndGgoMSkgKiBCbG9ja3MuQmxvY2suQmxvY2tTaXplWCkgfHwgcHJvamVjdGlsZS5ZID4gKF93b3JsZEJsb2Nrcy5HZXRMZW5ndGgoMCkgKiBCbG9ja3MuQmxvY2suQmxvY2tTaXplWSkpXHJcbiAgICAgICAgICAgICAgICB7IFxyXG4gICAgICAgICAgICAgICAgICAgIF9wcm9qZWN0aWxlcy5SZW1vdmVBdChpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxuXHJcbm5hbWVzcGFjZSBfMkRfVGVzdF9HYW1lLkJsb2Nrc1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgRGlydCA6IEJsb2NrXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBzdHJpbmcgRmlsZSA9IFwiaW1nL0RpcnRCbG9jay5wbmdcIjtcclxuICAgICAgICBwcml2YXRlIEhUTUxJbWFnZUVsZW1lbnQgX2ltZztcclxuXHJcbiAgICAgICAgcHVibGljIERpcnQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX2ltZyA9IG5ldyBIVE1MSW1hZ2VFbGVtZW50KClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgU3JjID0gRmlsZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxucHVibGljIG92ZXJyaWRlIGJvb2wgV2Fsa2FsYmxlXHJcbntcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgRHJhdyhDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgY252LCBpbnQgeCwgaW50IHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjbnYuRHJhd0ltYWdlKF9pbWcsIDAsMCwgQmxvY2tTaXplWCwgQmxvY2tTaXplWSwgeCx5LCBCbG9ja1NpemVYLCBCbG9ja1NpemVZKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBCcmlkZ2UuSHRtbDU7XHJcblxyXG5uYW1lc3BhY2UgXzJEX1Rlc3RfR2FtZS5CbG9ja3Ncclxue1xyXG4gICAgcHVibGljIGNsYXNzIEVtcHR5IDogQmxvY2tcclxuICAgIHtcclxuXHJcbiAgICAgICAgcHVibGljIEVtcHR5KClcclxuICAgICAgICB7XHJcbiAgICAgICAgfVxyXG5wdWJsaWMgb3ZlcnJpZGUgYm9vbCBXYWxrYWxibGVcclxue1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgRHJhdyhDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgY252LCBpbnQgeCwgaW50IHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxuXHJcbm5hbWVzcGFjZSBfMkRfVGVzdF9HYW1lLkJsb2Nrc1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgR3Jhc3MgOiBCbG9ja1xyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgY29uc3Qgc3RyaW5nIEZpbGUgPSBcImltZy9HcmFzc0Jsb2NrLnBuZ1wiO1xyXG4gICAgICAgIHByaXZhdGUgSFRNTEltYWdlRWxlbWVudCBfaW1nO1xyXG5wdWJsaWMgb3ZlcnJpZGUgYm9vbCBXYWxrYWxibGVcclxue1xyXG4gICAgZ2V0XHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuICAgICAgICBwdWJsaWMgR3Jhc3MoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX2ltZyA9IG5ldyBIVE1MSW1hZ2VFbGVtZW50KClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgU3JjID0gRmlsZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBEcmF3KENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCBjbnYsIGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNudi5EcmF3SW1hZ2UoX2ltZywgMCwwLCBCbG9ja1NpemVYLCBCbG9ja1NpemVZLCB4LHksIEJsb2NrU2l6ZVgsIEJsb2NrU2l6ZVkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxuXHJcbm5hbWVzcGFjZSBfMkRfVGVzdF9HYW1lLkJsb2Nrc1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgU3RvbmUgOiBCbG9ja1xyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgY29uc3Qgc3RyaW5nIEZpbGUgPSBcImltZy9TdG9uZUJsb2NrLnBuZ1wiO1xyXG4gICAgICAgIHByaXZhdGUgSFRNTEltYWdlRWxlbWVudCBfaW1nO1xyXG5cclxuICAgICAgICBwdWJsaWMgU3RvbmUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX2ltZyA9IG5ldyBIVE1MSW1hZ2VFbGVtZW50KClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgU3JjID0gRmlsZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxucHVibGljIG92ZXJyaWRlIGJvb2wgV2Fsa2FsYmxlXHJcbntcclxuICAgIGdldFxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIERyYXcoQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIGNudiwgaW50IHgsIGludCB5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY252LkRyYXdJbWFnZShfaW1nLCAwLDAsIEJsb2NrU2l6ZVgsIEJsb2NrU2l6ZVksIHgseSwgQmxvY2tTaXplWCwgQmxvY2tTaXplWSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG5cclxubmFtZXNwYWNlIF8yRF9UZXN0X0dhbWUuUHJvamVjdGlsZXNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFJpZmxlc2hvdCA6IFByb2plY3RpbGVcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgZG91YmxlIFNwZWVkIHsgc2V0OyBnZXQ7IH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgRHJhdyhDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgY29udGV4dCwgaW50IHgsIGludCB5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29udGV4dC5GaWxsU3R5bGUgPSBcInJlZFwiO1xyXG5cclxuICAgICAgICAgICAgY29udGV4dC5GaWxsUmVjdCh4LCB5LCAxMCwgMTApO1xyXG4gICAgICAgICAgICAvL2Nudi5TYXZlKCk7XHJcblxyXG4gICAgICAgICAgICAvLy8vIG1vdmUgdG8gdGhlIGNlbnRlciBvZiB0aGUgY2FudmFzXHJcbiAgICAgICAgICAgIC8vY252LlRyYW5zbGF0ZSh4ICsgKFBsYXllci5XaWR0aCAvIDIpLCB5ICsgKFBsYXllci5IZWlnaHQgLyAyKSk7XHJcbiAgICAgICAgICAgIC8vLy9jbnYuRmlsbFJlY3QoMCwgMCwgMjAsIDIwKTtcclxuICAgICAgICAgICAgLy9jbnYuUm90YXRlKChkb3VibGUpRGlyZWN0aW9uRGVncmVlcyAvICgxODAgLyBNYXRoLlBJKSk7XHJcbiAgICAgICAgICAgIC8vY252LkRyYXdJbWFnZShfaW1nV2VhcG9uLCAwLCAwLCBfaW1nV2VhcG9uLldpZHRoLCBfaW1nV2VhcG9uLkhlaWdodCwgMCwgLTUsIFdpZHRoICogMS41LCBIZWlnaHQgLyAyKTtcclxuICAgICAgICAgICAgLy9jbnYuUmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuXG4gICAgXG5wcml2YXRlIGRvdWJsZSBfX1Byb3BlcnR5X19Jbml0aWFsaXplcl9fU3BlZWQ9MzA3Mjt9XHJcblxyXG59XHJcbiJdCn0K
