// board.js

function board () {
    this.rows = [];
    this.rows.push(new row(2,12)); // red row
    this.rows.push(new row(2,12)); // yellow row
    this.rows.push(new row(12,2)); // green row
    this.rows.push(new row(12,2)); // blue row

    this.penalties = 0;

    this.scoreboard = function () {
        let score = 0;
        for (var i = 0; i < this.rows.length; i++) {
            score = score + this.rows[i].scorerow();
        }
        score = score - 5*this.penalties;
        return score;
    }
}

// how many checkmarks required to be able to lock a row? (not including the 2/12 on the right side)
var reqchecktolock = 5;

function row (startnumber, endnumber) {
    this.startnum = startnumber; // number on left
    this.endnum = endnumber; // number on right

    this.nums = [];
    for (i = 0; i <= (Math.abs(this.endnumber - this.startnumber)); i++) {
        this.nums.push(false);
    }

    this.rowlocked = false; // has the row been locked by the player?
    this.rowlined = false; // has the row been locked by another player?

    // how many checkmarks does this row have? this doesn't include the extra checkmark (at least not right now)
    this.countcheckmarks = function() {
        let checks = 0;
        for (var i = 0; i < this.nums.length; i++) {
            if (this.nums[i] === true) {
                checks++;
            }
        }
        return checks;
    }
    
    // is this row lockable (has more than reqchecktolock checkmarks)?
    this.islockable = function() {
        let checks = this.countcheckmarks();
        if (checks >= reqchecktolock) {
            return true;
        }
        return false;
    }

    // gives the score of this row
    // perhaps externalize this function eventually?
    this.scorerow = function() {
        let checks = this.countcheckmarks();
        if (this.rowlocked === true) {
            checks = checks + 1; // this accounts for the extra checkmark gained when locking a row
        }
        let score = Math.floor( checks * (checks + 1) / 2 );
        return score;
    }
}
