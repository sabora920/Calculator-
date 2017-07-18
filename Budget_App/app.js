/////////////////////////////////////////////////////////////////////////////// BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.Percentage = -1;
    };
    
    // Constructor that calculate the percentage for each individual expense item
    Expense.prototype.calcPercentage = function(totalIncome) {
        
        if (totalIncome > 0) {
            this.Percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.Percentage = -1;
        }
        
    };
    
    //this function gets the percentage from the object and then returns it
    Expense.prototype.getPercentage = function() {
        return this.Percentage
    };
    
    var Income = function(id, description, value) {
        this.id =id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
        
    };
    
    return {
        
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // Create New ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Cereate new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        
        // We need the type 'exp' or 'inc' and the amount to be able to delete an item successfully so call those paremeters for this function
        deleteItem: function(type, id) {
            
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function() {
          
            // Calculate the total income and expenses 
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses 
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        // Calculates the percentage of each individual item
        calculatePercentages: function() {
          
            data.allItems.exp.forEach(function(cur){
                //call the calcPercentage and pass the totals into it in order for them to be calculated individually
                cur.calcPercentage(data.totals.inc);
            });
            
        },
        
        
    // Displays the percentage of each individual expense 
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(cur) {
               return cur.getPercentage(); 
            });
            return allPercentages;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function() {
            console.log(data);
        }
    
    };
    
})();



////////////////////////////////////////////////////////////////////////////////////////////////////////////// UI CONTROLLER
var UIController = (function() {
    
    // These call the classes in the html that effect the fields within the UI
    var DOMstrings = {
        
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    };
    
            
        // This function is adding + or - before the inc and exp, adding 2 decimal points and adding a comma spearating the thousands
        var formatNumber = function(num, type) {
            
            var numSplit, int, dec;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            
            if(int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // if input is 2310 then output is 2,310
            }
            
            dec = numSplit[1];
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
            
        };
    
    return {
        
        getInput: function() {
            
            return {
                            
            type: document.querySelector(DOMstrings.inputType).value, // This will be either 'inc' or 'exp'
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
                
            };

        },
        
        addListItem: function(obj, type) {
            
            var html, newHtml, element;
            
            // HTML string with placeholder text
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%">\
                <div class="item__description">%description%</div><div class="right clearfix">\
                <div class="item__value">%value%</div><div class="item__delete">\
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type ==='exp') {
                element = DOMstrings.expensesContainer;
                    
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix">\
                <div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete">\
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace placeholder text with actual data in the UI
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        // Delete an entry from the UI
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        
        },
        
        // clear the fields after you enter a new income or expense 
        // First selecting the description and values then calling the array and setting the value back to ""
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            
            //put the focus or cursor back to the description field 
            fieldsArr[0].focus();
        },
        
        //displays the budget in the top part of the app
        displayBudget: function(obj) {
            
                //budget: data.budget,
                //totalInc: data.totals.inc,
                //totalExp: data.totals.exp,
                //percentage: data.percentage
            
                //budgetLabel: '.budget__value',
                //incomeLabel: '.budget__income--value',
                //expensesLabel: '.budget__expenses--value',
                //percentageLabel: '.budget__expenses--percentage'
            
            //the following query selectors are calling the above objects
            
            obj.budget > 0 ? type = 'inc' : type  = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            
            if(obj.percentage > 0) {
                
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';

            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }
            
        },
        
        // Display each individual percentage in the individual expenses
        displayPercentages: function(percentages) {
          
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            var nodeListForEach = function(list, callback) {
                
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
                
            };
            
            nodeListForEach(fields, function(current, index) {
               if (percentages[index] > 0) {
                current.textContent = percentages[index] + '%';
               } else {
                   current.textContent = '--';
               }
            });
            
        },
        
        displayMonth: function() {
            
            var now, year, month, months;
            
            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
})();



////////////////////////////////////////////////////////////////////////////// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMstrings();
          
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
       
            if (event.keycode === 13 || event.which === 13) {
                // console.log('ENTER was pressed');
                ctrlAddItem();  
            }
        });  
        
        
        // enables the delete via the 'x' on the income and expense
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
    };
    
    
    
    var updateBudget = function() {
                
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        
    };
    
    var ctrlAddItem = function() {
        
        var input, newItem;
        
        // 1. Get the filed input data
        var input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
                
            // 2. Add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
        
            // 4. Clear the fields where you input description and value
            UICtrl.clearFields();
        
            // 5. Calculate and Update budget
            updateBudget();
            
            // 6. Calculate and update percentages for each individual expense
            updatePercentages();
            
        }
    };
    
    // The 'event' parameter calls the function that listens for the 'enter' key or when use the check button
    // The 'ctrlDeleteItem' variable calls the function being made to be able to delete previous entries 
    var ctrlDeleteItem = function(event) {
        
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID [1]);
            
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4.  Calculate and update percentages for each individual expense
            updatePercentages();
            
        }
        
    };
    
    return {
        
        init: function() {
            
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
            
        }
    };
    
})(budgetController, UIController);

controller.init();



















