import React from 'react';
import {Line} from 'react-chartjs-2';
import * as zoom from 'chartjs-plugin-zoom';
import { Divider } from '@material-ui/core';
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

export default ({resultData}) => {
    console.log(resultData);
    const data = {
      
      labels: resultData.createdAt,
      datasets: [{
        label: 'Revenue',
        data: resultData.revenue,
        borderColor: '#2196f3',
        fill: false
      }, {
        label: 'Shipping Fee Paid by Customer',
        data: resultData.shippingFeePaidByCustomer,
        borderColor: '#9c27b0',
        fill: false
      }, {
        label: 'Shipping Fee Charged By Lazada',
        data: resultData.shippingFeeChargedByLAZ,
        borderColor: '#004444',
        fill: false
      }, {
        label: 'Profit',
        data: resultData.profit,
        borderColor: '#4caf50',
        fill: false
      }, {
        label: 'Cost',
        data: resultData.cost,
        borderColor: '#cc181e',
        fill: false
      }, {
        label: 'Payment Fee',
        data: resultData.paymentFee,
        borderColor: '#666666',
        fill: false
      }, {
        label: 'Flexi',
        data: resultData.promotionalFlexi,
        borderColor: '#eb8c00',
        fill: false
      }, {
        label: 'Voucher',
        data: resultData.promotionalVoucher,
        borderColor: '#a32020',
        fill: false
      }]
    };
  
    const options = {
      responsive:true,
      tooltips: {
         mode: 'index',
         intersect: false,
         callbacks: {
          title: function(tooltipItem, data) {
            return resultData.orderNo[tooltipItem[0].index];
            }
          }
      },
      hover: {
         mode: 'index',
         intersect: false
      },
      bezierCurve : false,
      elements: {
          line: {
              tension: 0
          }
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            tooltipFormat: 'LLL',
            displayFormats: {
                millisecond: 'HH:mm:ss.SSS',
                second: 'HH:mm:ss',
                minute: 'HH:mm',
                hour: 'MMM D h:mm',
                'day': 'MMM D h:mm',
                'week': 'MMM D h:mm',
                'month': 'MMM D h:mm',
                'quarter': 'MMM D h:mm',
                'year': 'MMM D YYYY h:mm',
            }
          }
      }]                 
      },
      pan:{
        enabled:true,
        mode:'x'
      },
      zoom:{
          enabled:true,
          mode:'xy'
      }

   }



   return (
       <div className="box-shadow p-3 my-5">
          <div className="py-2">
            <h5 className="text-left">Income Report</h5>
          </div>
          <Divider className="my-3" variant="middle"/>
          <div>
            <Line data={data} options={options} />
          </div>
       </div>
    );

    
}