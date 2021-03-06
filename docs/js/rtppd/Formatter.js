"use strict";

class Smoother{
	constructor(smoothTime,dt)
	{
		this.speed=0;
		this.smoothTime=smoothTime;
		this.dt=dt;
	}
			
	SmoothDamp(previousValue, targetValue)
	{
		let T1 = 0.36 * this.smoothTime;
		let T2 = 0.64 * this.smoothTime;
		let x = previousValue - targetValue;
		let newSpeed = this.speed + this.dt * (-1.0 / (T1 * T2) * x - (T1 + T2) / (T1 * T2) * this.speed);
		let newValue = x + this.dt * this.speed;
		this.speed = newSpeed;
		let result = targetValue + newValue;
		this.speed = isNaN(this.speed) ? 0.0 : this.speed;
		return isNaN(result)?0:result;
	}
}

class Formatter {
	constructor(format,digital = 2) {
        var pattern = /\$\{(([A-Z]|[a-z]|[0-9]|_|\.|,|\(|\)|\^|\+|\-|\*|\/|\%|\<|\>|\=|\!|\||\&|")+?)?(@\d+)?\}/g;

		this.format = format;
		this.args = [];
        this.varNames = [];
        this.smoothValues = {};

		while (true) {
            let arg = pattern.exec(this.format);
            if (arg == null) break;
			let rawExpr = arg[0].substring(2, arg[0].length - 1);
			let breakdExpr = rawExpr.split("@");
			if(breakdExpr.length>=2)
				digital = Number.parseInt(breakdExpr[1]);
			this.args.push({
				exprStr: rawExpr,
				expr: this._CreateExprFunction(this.preprocessExpr(breakdExpr[0])),
				digital: digital
			});
		}
	}

	preprocessExpr(expr){
		expr = expr.replace(/if/g,'_if');
        expr = expr.replace(/set\(\s*(\w+)\s*,/g,"set('$1',");
        expr = expr.replace(/smooth\((\w+)\)/g,"smooth('$1',$1)")
		return expr;
	}

	_set(name,val){
		if(window[name]==undefined){
			window[name]=0;
			this.varNames.push(name);
		}
		window[name]=val;
		return 0;
    }
    
    _smooth(name,val){ 
        var previousValueName = `${name}_previous`;

        if(this.smoothValues[name] === undefined){
            this.smoothValues[previousValueName] = 0.0;
            this.smoothValues[name] = new Smoother(window.smoothST,window.smoothDT);
        }
        return this.smoothValues[name].SmoothDamp(this.smoothValues[previousValueName],val);
    }

	resetVariables(){
		for(let name of this.varNames){
			window[name]=0;
        }
        this.smoothValues = {}
	}

	Format(tuple) {
		let formatted = this.format;

		for (let i = 0; i < this.args.length; ++i) {
			let expr = this.args[i].expr;
			let ret = 0;
			while (true) {
				try {
					ret = expr(
						tuple.realTimePP,
						tuple.realTimeAccuracyPP,
						tuple.realTimeAimPP,
						tuple.realTimeSpeedPP,
						tuple.maxPP,
						tuple.maxAccuracyPP,
						tuple.maxAimPP,
						tuple.maxSpeedPP,
						tuple.fullComboPP,
						tuple.fullComboAccuracyPP,
						tuple.fullComboAimPP,
						tuple.fullComboSpeedPP,
						tuple.count300,
						tuple.countGeki,
						tuple.countKatu,
						tuple.count100,
						tuple.count100,
						tuple.count50,
						tuple.countKatu,
						tuple.countGeki,
						tuple.countMiss,
						tuple.currentMaxCombo,
						tuple.currentMaxCombo,
						tuple.playerMaxCombo,
						tuple.playerMaxCombo,
						tuple.fullCombo,
						tuple.combo,
						tuple.objectsCount,
						tuple.time,
                        tuple.duration,
                        tuple.errorStatistics.UnstableRate,
                        tuple.errorStatistics.ErrorMin,
                        tuple.errorStatistics.ErrorMax,
						//function
                        (name, val) => this._set(name, val),
                        (name,val) => this._smooth(name,val)
					);
					break;
				} catch (e) {
					const message = e.message;
					const regex = /(\w+) is not defined/;
					if (regex.test(message)) {
						let v = regex.exec(message)[1];
						this._set(v,0);
						continue;
					}
					console.error(message);
					break;
				}
			}
			let value = ret.toFixed(this.args[i].digital);
			formatted = formatted.replace("${" + this.args[i].exprStr + "}", value);
		}

		return formatted;
	}

	_CreateExprFunction(expr) {
		return new Function(
			"rtpp",
			"rtpp_acc",
			"rtpp_aim",
			"rtpp_speed",
			"maxpp",
			"maxpp_acc",
			"maxpp_aim",
			"maxpp_speed",
			"fcpp",
			"fcpp_acc",
			"fcpp_aim",
			"fcpp_speed",
			"n300",
			"n300g",
			"n200",
			"n150",
			"n100",
			"n50",
			"nkatu",
			"ngeki",
			"nmiss",
			"rtmaxcombo",
			"current_maxcombo",
			"player_maxcombo",
			"maxcombo",
			"fullcombo",
			"combo",
			"objects_count",
			"playtime",
            "duration",
            "ur",
            "error_min",
            "error_max",
			//function
            "set",
            "smooth",
			`return ${expr};`
		);
	}
}

window["pi"] = Math.PI;
window["e"] = Math.E;
window["inf"] = Number.POSITIVE_INFINITY;

window["sin"] = Math.sin;
window["cos"] = Math.cos;
window["tan"] = Math.tan;
window["asin"] = Math.asin;
window["acos"] = Math.acos;
window["atan"] = Math.atan;
window["pow"] = Math.pow;
window["sqrt"] = Math.sqrt;
window["abs"] = Math.abs;
window["max"] = Math.max;
window["min"] = Math.min;
window["exp"] = Math.exp;
window["log"] = Math.log;
window["log10"] = Math.log10;
window["floor"] = Math.floor;
window["ceil"] = Math.ceil;
window["round"] = Math.round;
window["sign"] = Math.sign;
window["truncate"] = Math.trunc;
window["clamp"] = (a, min, max) => Math.max(Math.min(a, max), min);
window["lerp"] = (a, b, t) => (1 - t) * a + t * b;
window["random"] = (a, b) => (a || 0) + Math.random() * ((b || 1) - (a || 0));
window["getTime"] = () => new Date().getTime();
window["mod"] = (a, b) => a % b;
window["_if"] = (cond, a, b) => cond ? a : b;
window["isnan"] = Number.isNaN;
window["isinf"] = (a) => a == Number.NEGATIVE_INFINITY || a == Number.POSITIVE_INFINITY;