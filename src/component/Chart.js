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
//https://flatuicolors.com/palette/defo
export default ({resultData}) => {
    console.log(resultData);
    const data = {
      
      labels: resultData.createdAt,
      datasets: [{
        label: 'Revenue',
        data: resultData.revenue,
        borderColor: 'rgba(52, 152, 219,1.0)',
        backgroundColor : 'rgba(52, 152, 219,0.2)',
      }, {
        label: 'Shipping Fee Paid by Customer',
        data: resultData.shippingFeePaidByCustomer,
        borderColor: 'rgba(26, 188, 156,1.0)',
        backgroundColor : 'rgba(26, 188, 156,0.2)',
      }, {
        label: 'Shipping Fee Charged By Lazada',
        data: resultData.shippingFeeChargedByLAZ,
        borderColor: 'rgba(155, 89, 182,1.0)',
        backgroundColor : 'rgba(155, 89, 182,0.2)',
      }, {
        label: 'Profit',
        data: resultData.profit,
        borderColor: 'rgba(46, 204, 113,1.0)',
        backgroundColor : 'rgba(46, 204, 113,0.2)',
      }, {
        label: 'Cost',
        data: resultData.cost,
        borderColor: 'rgba(192, 57, 43,1.0)',
        backgroundColor : 'rgba(192, 57, 43,0.2)',
      }, {
        label: 'Payment Fee',
        data: resultData.paymentFee,
        borderColor: 'rgba(241, 196, 15,1.0)',
        backgroundColor : 'rgba(241, 196, 15,0.2)',
      }, {
        label: 'Flexi',
        data: resultData.promotionalFlexi,
        borderColor: '#34495e',
        backgroundColor : 'rgba(52, 73, 94,0.2)',
      }, {
        label: 'Voucher',
        data: resultData.promotionalVoucher,
        borderColor: '#95a5a6',
        backgroundColor : 'rgba(127, 140, 141,0.2)',
      }]
    };
  
    const options = {
      responsive:true,
      layout: {
        padding: {
            top: 5,
            left: 15,
            right: 15,
            bottom: 15
        }
      },
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
              // tension: 0
          }
      },
      scales: {
        xAxes: [{
          ticks: { display: false },
          // type: 'time',
          // distribution:'linear',
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
        }],
        yAxes: [{
          // stacked: true
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