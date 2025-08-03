import React, { createContext, useState, useEffect } from 'react';

const SalesContext = createContext();

const SalesProvider = ({ children }) => {
    const [sales, setSales] = useState([]);
    const [monthlysales, setmonthlysales] = useState([]);
    const [loading, setLoading] = useState(false);

    const localhost = "http://localhost:3000";


    // Add a new sale
    const addSale = async (id, quantity) => {
        try {
            console.log("reached at addsale method with id: ",id)
            console.log("reached at addsale method with Qty: ",quantity)
            const response = await fetch(`${localhost}/sales/itemsold/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ItemQuantity: quantity })
            });
            console.log("Done with request inside addsale method ")
           
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add sale");
            }
            const newSale = await response.json();
            setSales((prevSales) => [newSale.sale, ...prevSales]);
        } catch (error) {
            console.error("Error adding sale:", error);
        }
    };

    // Fetch sales for today
    const fetchTodaySales = async (day, month, year) => {
        try {
            console.log("reached at Todays sale method with date: ",day,' ',month,' ',year)
            // console.log("reached at addsale method with Qty: ",quantity)

            const response = await fetch(`${localhost}/sales/today?day=${day}&month=${month}&year=${year}`);
            
            if (!response.ok) throw new Error("Failed to fetch today's sales");

            const data = await response.json();
    
            if (data.success) {
                // If sales are found, update the state with the sales data
                setSales(data.sales);
            } else {
                // If no sales are found, empty the sales state
                setSales([]);
            }
            console.log("done with Todays sale response is: ", data)
            
        } catch (error) {
            console.error("Error fetching today's sales:", error);
        setSales([])
        }
    };

    // Fetch sales for a specific month
    const fetchMonthSales = async (month, year) => {
        try {
            console.log("reached at month sale method with date: ",month,' ',year)
            const response = await fetch(`${localhost}/sales/month?month=${month}&year=${year}`);
            if (!response.ok) throw new Error("Failed to fetch monthly sales");

        const data = await response.json();

        if (data.success) {
            // If sales are found, update the state with the sales data
            setmonthlysales(data.sales);
        } else {
            // If no sales are found, empty the monthly sales state
            setmonthlysales([]);
        }

        console.log("Done with month sale method data is: ", data);
    } catch (error) {
        console.error("Error fetching monthly sales:", error);
        setmonthlysales([]); // Clear the monthly sales state on error
    }
};



    return (
        <SalesContext.Provider value={{ sales, loading, addSale,fetchTodaySales, fetchMonthSales, monthlysales }}>
            {children}
        </SalesContext.Provider>
    );
};

export { SalesContext, SalesProvider };
