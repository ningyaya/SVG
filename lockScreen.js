$(function () {
    localStorage.setItem('GesturePass', '');//初始化密码
    var option = 'checkGesture';
    var setTime = 0;//设置密码状态
    var temp2Pass = '';

    //定义svg
    var doSvg = function () {
        var $that = $("#nineSvg"),
            that = $that[0],
            number = 9,//圆点个数
            canLine = false,
            thisL = '',//svg中d的值
            tempPass = [],
            canDoLine = false,//线是否在元素上
            passWord = 12369;//初始密码 

        //画圆点
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var node = $(document.createElementNS("http://www.w3.org/2000/svg", "circle")).attr({
                    'cx': 50 + 100 * j,
                    'cy': 50 + 100 * i,
                    'r': 30,
                    'stroke': 'rgba(255,255,255,1)',
                    'stroke-width': 2,
                    'fill': 'transparent',
                    'class': 'roundA',
                    'canDo': true

                });
                $that.append(node);
            }
        }
        //画入线段
        var DoLine = $(document.createElementNS("http://www.w3.org/2000/svg", "path")).attr({
            'stroke': 'lightblue',
            'stroke-width': 2,
            'fill': 'transparent',
            'd': ' '
        });

        $that.append(DoLine);
        //获取九宫格
        var circle = $that.find('circle');
        //在格子上按下
        circle.touchstart(function () {

            canLine = true;//可以画线
            var Mx = $(this).attr("cx");
            var My = $(this).attr("cy");
            //初始化原点
            thisL = 'M' + Mx + ' ' + My;
            markRound($(this));
            tempPass.push($(this).index() + 1)
        });

        //移动端touchmove得绑定监听
        document.getElementById("nineSvg").addEventListener("touchmove", function (e) {
            event.preventDefault();
            var _x = e.touches[0].clientX;
            var _y = e.touches[0].clientY;
            var len = e.touches.length;
            var target = e.touches[0].target;

            if (canLine) {
                var NowLin = DoLine.attr('d');
                var position = cursorPoint(_x, _y);//坐标换算,clientX换算成cx
                DoLine.attr({
                    'd': thisL + 'L' + position.x + ' ' + position.y
                });
                var cIndex = inCircle(_x, _y) - 1;
                if (cIndex !== 0) {
                    var tempCircle = circle.eq(cIndex);
                    if (tempCircle.attr('canDo') == 'true') {
                        markRound(tempCircle);
                        thisL = thisL + ' L' + tempCircle.attr("cx") + ' ' + tempCircle.attr("cy");
                        // console.log('incircle:', cIndex + 1, '\n', thisL)
                        // 改变轨迹
                        DoLine.attr({
                            'd': thisL
                        });
                        // 记录密码
                        tempPass.push(cIndex + 1);
                        // 标记不可选
                        tempCircle.attr('canDo', false);
                        //标记此时touch在元素上
                        canDoLine = true;
                    }
                }
            }
        });

        //touch已经离开了元素，标记
        circle.touchend(function () {
            canDoLine = false;
        });

        //touchend
        $that.touchend(function () {
            var nowPass = removeSameArr(tempPass).join('');//密码
            if (option === 'setGesture') {
                if (setTime === 0 && nowPass.length < 5) {
                    $("#hint").html("<strong>密码太短，至少需要5个点</strong>");
                } else if (setTime === 0) {
                    $("#hint").html("<strong>请再次输入手势密码</strong>");
                    temp2Pass = nowPass;
                    setTime = 1;
                } else if (setTime === 1) {
                    if (nowPass == temp2Pass) {
                        $("#hint").html("<strong>密码设置成功！</strong>");
                        passWord = nowPass;
                        localStorage.setItem('GesturePass', passWord);
                        setTime = 0;
                    } else {
                        $("#hint").html("<strong>两次输入密码不一致！</strong>");
                        temp2Pass = '';
                        setTime = 0;
                    }
                }
            } else if (option === 'checkGesture') {
                if (!localStorage.getItem('GesturePass')) {
                    $("#hint").html("<strong>请先修改密码，初始密码 12369</strong>");
                    if (passWord == nowPass) {
                        $("#hint").html("密码正确^_^");
                    } else {
                        $("#hint").html("输入密码有误,请先修改密码");
                    }
                } else {
                    passWord = localStorage.getItem('GesturePass');
                    $("#hint").html("<strong>请输入手势密码</strong>");
                    //验证密码
                    if (passWord == nowPass) {
                        $("#hint").html("密码正确^_^");
                    } else {
                        $("#hint").html("输入密码有误(┬＿┬)");
                    }
                }

            }

            // 清空密码数组
            tempPass = [];
            // console.log(nowPass, passWord)
            //如果不元素上,去除后两项
            if (!canDoLine) {
                DoLine.attr({
                    'd': thisL
                });
            }

            //标记不可划线
            canLine = false;

            // 清除样式
            $(that).find('.roundB').remove();
            $(that).find('.roundA').attr({
                'fill': 'transparent',
                'canDo': true,
                'stroke': 'rgba(255,255,255,0.5)'
            });
            DoLine.attr('d', '');

        });

        //去除相同的元素
        function removeSameArr(arr) {
            var thisArr = [];

            for (var i = 0; i < arr.length; i++) {
                if (thisArr.indexOf(arr[i]) == -1) thisArr.push(arr[i]);
            }
            return thisArr;
        }

        //标记选中的方法
        function markRound(obj) {
            var nowRound = obj,
                round = $(document.createElementNS("http://www.w3.org/2000/svg", "circle")).attr({
                    'cx': nowRound.attr('cx'),
                    'cy': nowRound.attr('cy'),
                    'r': 20,
                    'fill': '#fff',
                    'class': 'roundB'
                });

            $that.append(round);

            nowRound.attr({
                'stroke': '#fff',
                'fill': 'rgba(0,0,0,0.3)'
            });

        }
        function cursorPoint(x, y) {
            var svg = document.getElementById('nineSvg')
            var pt = svg.createSVGPoint();
            pt.x = x;
            pt.y = y;
            return pt.matrixTransform(svg.getScreenCTM().inverse());
        }
        //判断是否在圆内
        function inCircle(x, y) {
            var position = cursorPoint(x, y)
            var cirIndex = 0;
            for (var k = 0; k < 3; k++) {
                for (var l = 0; l < 3; l++) {
                    cirIndex++;
                    var x0 = 50 + 100 * l;
                    var y0 = 50 + 100 * k;
                    var temp = Math.pow((x0 - position.x), 2) + Math.pow((y0 - position.y), 2);
                    if (temp <= 900) {
                        return k * 3 + l + 1;
                    }

                }
            }
            return 1;
        };
    }//doSvg

    doSvg();

    $("input[name=opt]").on('click', function () {
        option = this.value;
        $("#hint").html("<strong>请输入手势密码</strong>");

    });

});