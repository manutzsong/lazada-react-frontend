import React from "react";

import axios from "axios";
import moment from "moment-timezone";

import "date-fns";
import CircularProgress from "@material-ui/core/CircularProgress";
import retryInterceptor from "axios-retry-interceptor";
import "../App.css";

import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import Button from "@material-ui/core/Button";

import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import {
	MuiPickersUtilsProvider,
	KeyboardDatePicker
} from "@material-ui/pickers";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Divider from "@material-ui/core/Divider";

import ListText from "../component/List";
import List from '@material-ui/core/List';

import FinancialChartMixed from "../component/Chart";
import TopProductPie from "../component/TopProductPie";
import SmallChart from "../component/SmallChart";
import { Paper } from "@material-ui/core";

import {Link as RouterLink} from "react-router-dom";
import NavigationIcon from "@material-ui/icons/Navigation";
const urlAPI = "https://manutzsong-laz.ddns.net/node-sv";
// const urlAPI = "http://localhost:3002";

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			startDateUserSelect: moment()
				.add(-2, "days")
				.startOf("day")
				.format(),
			endDateUserSelect: moment()
				.endOf("day")
				.format(),
			statusOrder: "delivered",

			resultTransactions : null,
			resultOrders: null,
			resultOrderItems : null,

			resultInventory : null,

			wideFinancial : null,

			chartOrderNoArray : {},
			chartTopSellArray : {},
			chartAllSKUsArray : {},

			potentialGain : null,
			potentialLoss : null,

			bottom: true,
			isLoading: true,
		};
	}
	componentDidMount() {
		this.getData();
	}

	getRandomColor = () => {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

	getData = async() => {
		await this.setState({isLoading : "Getting Transactions. || รอนานเป็นปรกติ ห้ามกด Refresh || โปรดด่า Lazada 555+ "});

		let resultTransactions = () => axios({
			method: 'post',
			url: `${urlAPI}/transactions`,
			timeout: 60 * 10 * 1000, // Let's say you want to wait at least 4 mins
			data: {
				accesstoken : sessionStorage.getItem("accesstoken"), 
				status: this.state.statusOrder, 
				startdate : this.state.startDateUserSelect , 
				enddate: this.state.endDateUserSelect,
				userid : sessionStorage.getItem("userid")
			}
		});

		const getOrderItems = async() => {
			let resultOrders = await axios({
				method: 'post',
				url: `${urlAPI}/getorders`,
				timeout: 60 * 10 * 1000, // Let's say you want to wait at least 4 mins
				data: {
					accesstoken : sessionStorage.getItem("accesstoken"), 
					status: this.state.statusOrder, 
					startdate : this.state.startDateUserSelect , 
					enddate: this.state.endDateUserSelect,
				}
			});
			
			let orderNumberArray = resultOrders.data.map(z => z.order_number);//get only order_number
			// console.log(JSON.stringify(orderNumberArray) );
			//wait till orders finish

			let orderHundreadArray = [];
			let offset = 0;
			for (let i=0;i<orderNumberArray.length;i++) {
				if (i % 100 === 0) {
					if(i !== 0) {
						
						offset += 1;
					}
					orderHundreadArray[offset] = []; //init
				}

				orderHundreadArray[offset].push(orderNumberArray[i]);
			}

			const itemsGet = (arrayOfOrders) => axios({
				method: 'post',
				url: `https://manutzsong-laz.ddns.net/python-sv/getorderitems`,
				timeout: 60 * 10 * 1000, // Let's say you want to wait at least 4 mins
				data: {
					accesstoken : sessionStorage.getItem("accesstoken"), 
					orders : JSON.stringify(arrayOfOrders) ,//[12,984,32214]
				}
			});

			let result = await Promise.all(orderHundreadArray.map(x => itemsGet(x) ));
			result = result.flatMap(x => x.data.data).flatMap(z => z.order_items);
			// console.log(result);

			await this.setState({resultOrders : resultOrders.data, resultOrderItems : result});
			console.log(this.state.resultOrderItems);
			return;
		}

		let resultPromises = await Promise.all([resultTransactions, getOrderItems].map(x => x() ) );
		this.promisesFreqNChart(resultPromises[0]);
	}

	transactionMutate = async(result) => {
		let resultAxios = result.data;
	
		let transactions = resultAxios.debugTransaction;
		let orders = resultAxios.debugOrder;
		let inventory = resultAxios.debugInventory;

		console.log(resultAxios);
		// if()
		try {
			//llop transaction
			let transactionsAppend = {}; //group up
			let sumThisPLS = 0;
			transactions.forEach((x,xIndex) => {
				
				sumThisPLS += Number(x.amount);
				
				const groupThis = x.orderItem_no;//change this LINE if you want to change matching key
				if (typeof transactionsAppend[groupThis] === "undefined") {//if first
					let orderFiltered = orders.find(z => z.order_id == x.order_no);
					let inventoryFiltered = inventory.find(z => z.lazada_sku == x.lazada_sku);
					// console.log(inventoryFiltered,x.lazada_sku);
		
					transactionsAppend[groupThis] = { 
						count: 1, 
						transaction: x,//only 1 enough
						order : orderFiltered,
						inventory : inventoryFiltered,
		
						created_date : orderFiltered.created_at,
		
						itemPriceCredit : 0,
						profit : 0,
						cost : inventoryFiltered ? inventoryFiltered.product_cost : 0,//catch undefine inv
						
						paymentFee : 0,
		
						promotionalFlexi : 0,
						promotionalVoucher : 0,
		
						adjustmentShippingFee : 0,
		
						shippingFeePaidByCustomer : 0,
						shippingFeeChargedByLAZ : 0,
						shippingFeeVoucher : 0,
		
						otherFee : 0,
		
						total : inventoryFiltered ? inventoryFiltered.product_cost : 0,//default as Cost
		
						
					};
		
					if (x.fee_name === "Shipping Fee (Paid By Customer)") {
						transactionsAppend[groupThis].shippingFeePaidByCustomer = Number(x.amount);
						// transactionsAppend[groupThis].wideShippingByCust += shippingFeePaidByCustomer;
					} else if (x.fee_name === "Payment Fee") {
						transactionsAppend[groupThis].paymentFee += Number(x.amount);
						// transactionsAppend[groupThis].widePaymentFee += paymentFee;
					} else if (x.fee_name === "Item Price Credit") {
						transactionsAppend[groupThis].itemPriceCredit += Number(x.amount);
						// transactionsAppend[groupThis].wideRevenue += itemPriceCredit;
					} else if (x.fee_name === "Promotional Charges Flexi-Combo") {
						transactionsAppend[groupThis].promotionalFlexi += Number(x.amount);
						// transactionsAppend[groupThis].wideFlexi += promotionalFlexi;
					} else if (x.fee_name === "Shipping Fee (Charged by Lazada)") {
						transactionsAppend[groupThis].shippingFeeChargedByLAZ += Number(x.amount);
						// transactionsAppend[groupThis].wideShippingByLAZ += shippingFeeChargedByLAZ;
					} else if (x.fee_name === "Promotional Charges Vouchers") {
						transactionsAppend[groupThis].promotionalVoucher += Number(x.amount);
						// transactionsAppend[groupThis].wideVoucher += promotionalVoucher;
					} else if (x.fee_name === "Adjustments Shipping Fee") {
						transactionsAppend[groupThis].adjustmentShippingFee += Number(x.amount);
						// transactionsAppend[groupThis].wideVoucher += promotionalVoucher;
					} else if (x.fee_name === "Shipping Fee Voucher (by Lazada)") {
						transactionsAppend[groupThis].shippingFeeVoucher += Number(x.amount);
						// transactionsAppend[groupThis].wideVoucher += promotionalVoucher;
					} else {
						transactionsAppend[groupThis].otherFee += Number(x.amount);
					}
					transactionsAppend[groupThis].total += Number(x.amount);
					// console.log(`INIT : >>> ${Number(x.amount)} |  ${transactionsAppend[groupThis].total}  | ${groupThis}`);
					
				} else {//if not
					
					if (x.fee_name === "Shipping Fee (Paid By Customer)") {
						transactionsAppend[groupThis].shippingFeePaidByCustomer = Number(x.amount);
						// transactionsAppend[groupThis].wideShippingByCust += shippingFeePaidByCustomer;
					} else if (x.fee_name === "Payment Fee") {
						transactionsAppend[groupThis].paymentFee += Number(x.amount);
						// transactionsAppend[groupThis].widePaymentFee += paymentFee;
					} else if (x.fee_name === "Item Price Credit") {
						transactionsAppend[groupThis].itemPriceCredit += Number(x.amount);
						// transactionsAppend[groupThis].wideRevenue += itemPriceCredit;
					} else if (x.fee_name === "Promotional Charges Flexi-Combo") {
						transactionsAppend[groupThis].promotionalFlexi += Number(x.amount);
						// transactionsAppend[groupThis].wideFlexi += promotionalFlexi;
					} else if (x.fee_name === "Shipping Fee (Charged by Lazada)") {
						transactionsAppend[groupThis].shippingFeeChargedByLAZ += Number(x.amount);
						// transactionsAppend[groupThis].wideShippingByLAZ += shippingFeeChargedByLAZ;
					} else if (x.fee_name === "Promotional Charges Vouchers") {
						transactionsAppend[groupThis].promotionalVoucher += Number(x.amount);
						// transactionsAppend[groupThis].wideVoucher += promotionalVoucher;
					} else if (x.fee_name === "Adjustments Shipping Fee") {
						transactionsAppend[groupThis].adjustmentShippingFee += Number(x.amount);
						// transactionsAppend[groupThis].wideVoucher += promotionalVoucher;
					} else if (x.fee_name === "Shipping Fee Voucher (by Lazada)") {
						transactionsAppend[groupThis].shippingFeeVoucher += Number(x.amount);
						// transactionsAppend[groupThis].wideVoucher += promotionalVoucher;
					} else {
						transactionsAppend[groupThis].otherFee += Number(x.amount);
					}
					transactionsAppend[groupThis].total += Number(x.amount);
					// console.log(`${Number(x.amount)} |  ${transactionsAppend[groupThis].total}  | ${groupThis}`);
				}
		
			});//end loop transactions
			console.log(sumThisPLS);
			let transactionNotJSON = [];//fix JSON of JSON to Array of JSON Obj
			let wideFinancial = {
				itemPriceCredit : 0,
				profit : 0,
				cost : 0,
				paymentFee : 0,
				promotionalFlexi : 0,
				promotionalVoucher : 0,
				adjustmentShippingFee : 0,
				shippingFeePaidByCustomer : 0,
				shippingFeeChargedByLAZ : 0,
				shippingFeeVoucher : 0,
				otherFee : 0,
				total : 0,
			};

			// transactionNotJSON.sort((a,b) => a.created_date)
		
			for (let x in transactionsAppend) {
				
				transactionsAppend[x].profit = transactionsAppend[x].itemPriceCredit - transactionsAppend[x].cost;//calc profit here
				console.log(transactionsAppend[x]);

				wideFinancial.itemPriceCredit += transactionsAppend[x].itemPriceCredit;
				wideFinancial.profit += transactionsAppend[x].profit;
				wideFinancial.cost += transactionsAppend[x].cost;
				wideFinancial.paymentFee += transactionsAppend[x].paymentFee;
				wideFinancial.promotionalFlexi += transactionsAppend[x].promotionalFlexi;
				wideFinancial.promotionalVoucher += transactionsAppend[x].promotionalVoucher;
				wideFinancial.adjustmentShippingFee += transactionsAppend[x].adjustmentShippingFee;
				wideFinancial.shippingFeePaidByCustomer += transactionsAppend[x].shippingFeePaidByCustomer;
				wideFinancial.shippingFeeChargedByLAZ += transactionsAppend[x].shippingFeeChargedByLAZ;
				wideFinancial.shippingFeeVoucher += transactionsAppend[x].shippingFeeVoucher;
				wideFinancial.otherFee += transactionsAppend[x].otherFee;
				wideFinancial.total += transactionsAppend[x].total;
		
				
				transactionNotJSON.push(transactionsAppend[x]);
			}
		
			let writeThis = {transactions : transactionNotJSON, wideFinancial : wideFinancial, orders : orders, inventory : inventory};
			return writeThis;
		}
		catch(e) {
			throw e;
		}
	}




	promisesFreqNChart = async(result) => {
		try {
			let resultReturn = await this.transactionMutate(result);
			await this.setState({
				resultTransactions : resultReturn.transactions,
				resultInventory : result.inventory,
				wideFinancial : resultReturn.wideFinancial});
			// await this.prepareChartOrderNo();
			await Promise.all([this.prepareChartOrderNo, this.countFrequency].map(z => z() ));
		}
		catch(e) {
			let potentialLoss = 0;
			let potentialGain = 0;
			this.state.resultOrderItems.forEach(x => {
				if (x.status === "canceled") {
					potentialLoss += x.item_price;
				}
				else {
					potentialGain += x.item_price;
				}
			});
			if (potentialGain === 0) {
				await this.setState({potentialLoss : potentialLoss, potentialGain : null,});
			}
			else {
				await this.setState({potentialGain : potentialGain, potentialLoss : null});
			}

			await Promise.all([this.countFrequency].map(z => z() ));
		}
		await this.setState({isLoading:false});
	}

	countFrequency = () => { new Promise((resolve) => {
		
		let counts = {};
		this.state.resultOrderItems.forEach(i => {
			// countFlattenTransaction[ i.shop_sku.split("_")[0] ].count = countFlattenTransaction[ i.shop_sku.split("_")[0] || 0 +=1
			const matchThis = i.shop_sku.split("_")[0];
			if (typeof counts[matchThis] === "undefined") {
			counts[matchThis] = { count: 1, product: i,title: matchThis};
			} else {
			counts[matchThis].count =
				(counts[matchThis].count || 1) + 1;
			}
		});
		
		let orderedCounts = [];
		for (let z in counts) {
			orderedCounts.push(counts[z])
		}

		orderedCounts.sort((a,b) => b.count - a.count);
		console.log(orderedCounts);
		counts = orderedCounts;

		let pieThis = {
			labels : [],
			values : [],
			titles : [],
			colors: [],
			img : [],
			url : [],
		}
		for (let z in counts) {
			console.log(z);
			pieThis.labels.push(counts[z].title);
			pieThis.values.push(counts[z].count);
			pieThis.titles.push(counts[z].product.name);
			pieThis.colors.push(this.getRandomColor());
			pieThis.img.push(counts[z].product.product_main_image ? counts[z].product.product_main_image : "https://dummyimage.com/600x600/ffffff/000000.jpg&text=NO+IMG");
			pieThis.url.push(counts[z].product.product_detail_url ? counts[z].product.product_detail_url : "https://lazada.co.th/sn-fashion");
		}
		console.log(pieThis);
		
		//endTop

		let countsSKUs = {};
		this.state.resultOrderItems.forEach(i => {
			// countFlattenTransaction[ i.shop_sku.split("_")[0] ].count = countFlattenTransaction[ i.shop_sku.split("_")[0] || 0 +=1
			let matchThis = i.shop_sku;
			if (typeof countsSKUs[matchThis] === "undefined") {
				countsSKUs[matchThis] = { count: 1, product: i, title: matchThis };
			} else {
				countsSKUs[matchThis].count =
				(countsSKUs[matchThis].count || 1) + 1;
			}
		});

		let orderedCountsSKUs = [];
		for (let z in countsSKUs) {
			orderedCountsSKUs.push(countsSKUs[z])
		}

		orderedCountsSKUs.sort((a,b) => b.count - a.count);
		countsSKUs = orderedCountsSKUs;

		let pieThisSKUs = {
			labels : [],
			values : [],
			titles : [],
			colors: [],
			img : [],
			url : [],
		}
		for (let z in countsSKUs) {
			pieThisSKUs.labels.push(countsSKUs[z].title);
			pieThisSKUs.values.push(countsSKUs[z].count);
			pieThisSKUs.titles.push(countsSKUs[z].product.sku);
			pieThisSKUs.colors.push(this.getRandomColor());
			pieThisSKUs.img.push(countsSKUs[z].product.product_main_image ? countsSKUs[z].product.product_main_image : "https://dummyimage.com/600x600/ffffff/000000.jpg&text=NO+IMG");
			pieThisSKUs.url.push(countsSKUs[z].product.product_detail_url ? countsSKUs[z].product.product_detail_url : "https://lazada.co.th/sn-fashion");
		}

		console.log(countsSKUs);



		this.setState({chartTopSellArray : pieThis, chartAllSKUsArray : pieThisSKUs},() => resolve() );

		})//end resolve
	}

	prepareChartOrderNo = () => { new Promise((resolve) => {
		let arraySaveThis = {
			cost : [],
			profit :[],
			revenue :[],
			paymentFee : [],
			shippingFeePaidByCustomer : [],
			shippingFeeChargedByLAZ : [],
			promotionalFlexi : [],
			promotionalVoucher : [],
			createdAt : [],
			orderNo : [],
		}

		let resultTransactions = this.state.resultTransactions;
		
		resultTransactions.sort((a, b) => {
			return moment.utc(a.created_date).diff(moment.utc(b.created_date))
		});

		for (let z in resultTransactions) {
			arraySaveThis.cost.push(Math.abs(resultTransactions[z].cost));
			arraySaveThis.profit.push(resultTransactions[z].profit);
			arraySaveThis.revenue.push(resultTransactions[z].itemPriceCredit);
			arraySaveThis.paymentFee.push(Math.abs(resultTransactions[z].paymentFee));
			arraySaveThis.shippingFeePaidByCustomer.push(resultTransactions[z].shippingFeePaidByCustomer);
			arraySaveThis.shippingFeeChargedByLAZ.push(Math.abs(resultTransactions[z].shippingFeeChargedByLAZ));
			arraySaveThis.promotionalFlexi.push(Math.abs(resultTransactions[z].promotionalFlexi));
			arraySaveThis.promotionalVoucher.push(Math.abs(resultTransactions[z].promotionalVoucher));

			arraySaveThis.createdAt.push(resultTransactions[z].created_date);
			arraySaveThis.orderNo.push(resultTransactions[z].transaction.order_no);
		}




		this.setState({chartOrderNoArray : arraySaveThis},() => {
			return resolve("done");
		});

		})
	}

 
	//INPUT

	handleInputChange = event => {
		console.log(event);
		const target = event.target;
		const value = target.type === "checkbox" ? target.checked : target.value;
		const name = target.name;

		console.log(value);

		this.setState({
			[name]: value
		});
	};

	handleStartDate = e => {
		let value = moment(e)
			.startOf("day")
			.format();
		this.setState({ startDateUserSelect: value });
		console.log(value);
	};
	handleEndDate = e => {
		let value = moment(e)
			.endOf("day")
			.format();
		this.setState({ endDateUserSelect: value });
		console.log(value);
	};

	toggleDrawer = (side, open) => event => {
		if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
		  return;
		}
	
		this.setState({ [side]: open });
	  };

	fullList = side => (
		<div
		//   style={{width:"auto"}}
		  role="presentation"
		//   onClick={this.toggleDrawer(side, false)}
		//   onKeyDown={this.toggleDrawer(side, false)}
		>
					<div className="">
						<div className="d-flex align-items-center m-0">
							<div className="col-3 d-flex justify-content-around flex-column">
								<MuiPickersUtilsProvider utils={DateFnsUtils}>
									<KeyboardDatePicker
										name="startDate"
										margin="normal"
										id="date-picker-dialog"
										label="Start Date (Before Date)"
										format="MM/dd/yyyy"
										value={this.state.startDateUserSelect}
										onChange={this.handleStartDate}
										KeyboardButtonProps={{
											"aria-label": "change date"
										}}
									/>

									<KeyboardDatePicker
										name="startDate"
										margin="normal"
										id="date-picker-dialog"
										label="End Date (After Date)"
										format="MM/dd/yyyy"
										value={this.state.endDateUserSelect}
										onChange={this.handleEndDate}
										KeyboardButtonProps={{
											"aria-label": "change date"
										}}
									/>
								</MuiPickersUtilsProvider>
							</div>
							<div className="col-2 align-self-start text-left mt-3">
								<FormLabel component="legend">Status</FormLabel>
								<RadioGroup
									aria-label="statusSelected"
									name="statusSelected"
									value={this.state.statusOrder}
									onChange={e => this.setState({ statusOrder: e.target.value })}
								>
									<FormControlLabel
										value="delivered"
										control={<Radio />}
										label="Delivered"
									/>
									<FormControlLabel
										value="shipped"
										control={<Radio />}
										label="Shipped"
									/>
									<FormControlLabel
										value="canceled"
										control={<Radio />}
										label="Canceled"
									/>
									<FormControlLabel
										value="ready_to_ship"
										control={<Radio />}
										label="Ready to Ship"
									/>
								</RadioGroup>
							</div>
							<div className="col-1">
								<Button
									
									variant="contained"
									color="primary"
									onClick={() => {
										this.getData();
										this.toggleDrawer("left", false);
									}}
								>
									Submit
								</Button>
							</div>
							<div className="col-4">
								<Divider orientation="vertical" style={{alignSelf:"stretch",height:"auto"}}/>
								<Button variant="contained" color="secondary" component={RouterLink} to="/success">
									แก้ไข Cost | Edit Cost
								</Button>
							</div>
							<div className="d-flex justify-content-between flex-column">
								<div>
									<h3>Milestone :</h3>
									<h6>- Order Count 💙</h6>
									<h6>- Item Count 💙</h6>
									<h6>- Python SV still use for /getorderitems 💙</h6>
								</div>
								<Divider/>
								<h6>Contact 🍺: </h6>
								<p>manutzsong@gmail.com</p>
							</div>
						</div>
					</div>
		</div>
	  );

	//INPUT

	shouldReturnIncomeReport = () => {
		if (this.state.potentialGain) {
			return <div className="d-flex flex-column justify-content-between align-items-center">
				<h4 className="text-success">Potential Gain</h4>
				<h2 className="text-success">{this.state.potentialGain} ฿</h2>
			</div>
		}
		else if (this.state.potentialLoss) {
			return <div className="d-flex flex-column justify-content-between align-items-center">
				<h4 className="text-danger">Potential Loss !</h4>
				<h2 className="text-danger">{this.state.potentialLoss} ฿</h2>
			</div>
		}
		else {
			return <div className="row d-flex justify-content-between align-items-center">
			<div className="col-9">
				<FinancialChartMixed resultData={this.state.chartOrderNoArray} />
			</div>
			<div className="col-3">
				<div className="text-left p-2 mb-3 box-shadow">
					<h5 className="text-secondary">From Date : </h5>
					<h5>{this.state.startDateUserSelect}</h5>
					<h5 className="text-secondary">To Date : </h5>
					<h5>{this.state.endDateUserSelect}</h5>
				</div>

				<List disablePadding dense component={Paper}>
					<ListText primary={"฿ " + this.state.wideFinancial.itemPriceCredit} secondary="Revenue" divider={true}/>
					<ListText primary={"฿ " + this.state.wideFinancial.paymentFee} secondary="Payment Fee" divider={true}/>
					<ListText primary={"฿ " + this.state.wideFinancial.cost} secondary="Cost" divider={true} />
					<ListText primary={"฿ " + this.state.wideFinancial.profit} secondary="Profit" divider={true}/>
					<ListText primary={"฿ " + this.state.wideFinancial.promotionalFlexi} secondary="Promotional Flexi" divider={true}/>
					<ListText primary={"฿ " + this.state.wideFinancial.promotionalVoucher} secondary="Promotional Voucher" divider={true}/>
					<ListText primary={"฿ " + this.state.wideFinancial.shippingFeeChargedByLAZ} secondary="Shipping Fee Charged By Lazada" divider={true}/>
					<ListText primary={"฿ " + this.state.wideFinancial.shippingFeePaidByCustomer} secondary="Shipping Fee Paid By Customer" divider={true}/>
				</List>
			</div>
		</div>
		}
	}
	


	render() {
		if (this.state.isLoading) {
			return (
				<div className="d-flex vh-100 justify-content-center">
					<div className="align-self-center align-items-center d-flex">
						<div>
							<CircularProgress />
						</div>
						<div className="px-3">
							<h4>{this.state.isLoading}</h4>
						</div>
					</div>
				</div>
			);
		}
		return (
			
			
				<div className="bg-light p-3">

					<div className="fixed-bottom bg-white" stype={{zIndex:1000001}}>
						<Button 
						size="large"
						aria-label="large contained secondary button group"
						color="primary" style={{zIndex:1000002}} fullWidth={true} onClick={this.toggleDrawer('bottom', true)}>แก้ไขผลแสดง | แก้ไข Cost <NavigationIcon /> </Button>
					</div>

					<SwipeableDrawer
						anchor="bottom"
						open={this.state.bottom}
						onClose={this.toggleDrawer('bottom', false)}
						onOpen={this.toggleDrawer('bottom', true)}
					>
						{this.fullList('bottom')}
					</SwipeableDrawer>

					<br></br>
					<h6 className="text-danger">แสดงจากการจ่ายเงินของ Lazada โดยถ้า Lazada จ่ายมาแล้วถึงแสดง ทั้งนี้ Order นั้นอาจเกิดขึ้นก่อนวันที่เลือกก็ได้.</h6>
					<h6 className="text-danger">Mobile is not ready. ใช้งานบน คอม เท่านั้น หรือจอ ใหญ่ๆ</h6>
					<Divider variant="middle"/>
					<h5>Help me by buying from this store หรือ อุดหนุนร้านคนทำ <a href="https://www.lazada.co.th/shop/sn-fasion/">SN-Fashion 💗</a></h5>
					<h5 className="">or help contribute to this project via <a href="https://github.com/manutzsong/lazada-react-frontend">Github</a></h5>
					<Divider variant="middle"/>
					<p>W.I.P., I will constantly update this project.</p>

					{this.shouldReturnIncomeReport()}
					

					<div className="row d-flex align-items-center justify-content-around">
						<SmallChart borderColor="rgba(52, 152, 219,1.0)" backgroundColor="rgba(52, 152, 219,0.2)" title="Revenue - ยอดขาย" label={this.state.chartOrderNoArray.createdAt} point={this.state.chartOrderNoArray.revenue} orderNo={this.state.chartOrderNoArray.orderNo} />
						<SmallChart borderColor="rgba(192, 57, 43,1.0)" backgroundColor="rgba(192, 57, 43,0.2)" title="Cost - ต้นทุน" label={this.state.chartOrderNoArray.createdAt} point={this.state.chartOrderNoArray.cost} orderNo={this.state.chartOrderNoArray.orderNo} />
						<SmallChart borderColor="rgba(46, 204, 113,1.0)" backgroundColor="rgba(46, 204, 113,0.2)" title="Profit - กำไร" label={this.state.chartOrderNoArray.createdAt} point={this.state.chartOrderNoArray.profit} orderNo={this.state.chartOrderNoArray.orderNo} />
						<SmallChart borderColor="rgba(241, 196, 15,1.0)" backgroundColor="rgba(241, 196, 15,0.2)" title="Payment Fee - ค่าธรรมเนียม" label={this.state.chartOrderNoArray.createdAt} point={this.state.chartOrderNoArray.paymentFee} orderNo={this.state.chartOrderNoArray.orderNo} />
					</div>

					<div className="row">
						<div className="col-6"><TopProductPie className="" resultData={this.state.chartTopSellArray} title="Top Selling By Product"/></div>
						<div className="col-6"><TopProductPie className="" resultData={this.state.chartAllSKUsArray} title="Top Selling By SKU"/></div>
					</div>
					
					




				</div>
			
		);
	}
}
