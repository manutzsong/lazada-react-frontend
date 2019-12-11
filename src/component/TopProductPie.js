import React from 'react';
import {Doughnut} from 'react-chartjs-2';
import * as zoom from 'chartjs-plugin-zoom';
import List from '@material-ui/core/List';
import ListText from './List';
import { Paper, Divider } from '@material-ui/core';
/*
      arraySaveThis.cost.push(Math.abs(resultTransactions[z].product_cost));
			arraySaveThis.profit.push(resultTransactions[z].profit);
			arraySaveThis.revenue.push(resultTransactions[z].itemPriceCredit);
			arraySaveThis.paymentFee.push(Math.abs(resultTransactions[z].paymentFee));
			arraySaveThis.shippingFeePaidByCustomer.push(resultTransactions[z].shippingFeePaidByCustomer);
			arraySaveThis.shippingFeeChargedByLAZ.push(Math.abs(resultTransactions[z].shippingFeeChargedByLAZ));
			arraySaveThis.promotionalFlexi.push(Math.abs(resultTransactions[z].promotionalFlexi));
			arraySaveThis.promotionalVoucher.push(Math.abs(resultTransactions[z].promotionalVoucher));

			arraySaveThis.createdAt.push(resultTransactions[z].items[0].order_info[0].created_at);
			arraySaveThis.orderNo.push(resultTransactions[z].items[0].order_no)
		}

*/

export default ({resultData,title}) => {


    console.log(resultData);
    const data = {
      labels: resultData.titles,
      datasets: [{
        data: resultData.values,
        backgroundColor: resultData.colors
      }]
    };
  
    const options = {
      legend: {
        display: false,
     },
   }

   

   let renderList = () => {
     let onlyTen = resultData.titles.length < 10 ? resultData.titles.length : 10;
     let returnThis = [];
     for (let i=0;i<onlyTen;i++ ) {
       returnThis.push(<ListText divder={true} key={resultData.titles[i]} primary={resultData.titles[i]} secondary={resultData.values[i]} imgSrc={resultData.img[i]} url={resultData.url[i]}></ListText>)
     }
     return returnThis;
   }


   return (
      
      <div className="p-4 box-shadow my-5">
        <h5 className="text-left py-2">{title}</h5>
        <Divider />
        <div className="row d-flex justify-content-around align-items-center">
          <div className="col-9">
            <Doughnut data={data} options={options} />
          </div>
          <div className="col-3">
            <List  disablePadding dense component={Paper}>{renderList()}</List>
          </div>
        </div>
      </div>
    );

    
}