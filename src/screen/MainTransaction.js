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


// const urlAPI = "http://lazada-song-ws.herokuapp.com";
const urlAPI = "https://manutzsong-laz.ddns.net/node-sv";

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
			resultOrderItem : null,
			wideFinancial : null,

			chartOrderNoArray : {},
			chartTopSellArray : {},
			chartAllSKUsArray : {},

			left: false,
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

	getData = () => {
		this.setState({isLoading : "Getting Transactions. || รอนานเป็นปรกติ ห้ามกด Refresh || โปรดด่า Lazada 555+ "}, _ => {
			axios({
				method: 'post',
				url: `${urlAPI}/transactions`,
				timeout: 60 * 10 * 1000, // Let's say you want to wait at least 4 mins
				data: {
					accesstoken : sessionStorage.getItem("accesstoken"), 
					status: this.state.statusOrder, 
					startdate : this.state.startDateUserSelect , 
					enddate: this.state.endDateUserSelect 
				}
			  })
			.then(result => {
				
				let resultTransactions = [];
				for (let z in result.data.orderNo) {
					resultTransactions.push(result.data.orderNo[z]);
				}
				this.setState({resultTransactions : resultTransactions, resultOrderItem : result.data.orderItemID, wideFinancial : result.data.wideFinancial},() => {
					this.prepareChartOrderNo();
					this.countFrequency();
				});	
			}).catch(e => {
				console.log(e);
			});
		});
	}

	countFrequency = () => {
		let counts = {};
		this.state.resultOrderItem.forEach(i => {
			// countFlattenTransaction[ i.shop_sku.split("_")[0] ].count = countFlattenTransaction[ i.shop_sku.split("_")[0] || 0 +=1
			if (typeof counts[i.lazada_sku.split("_")[0]] === "undefined") {
			counts[i.lazada_sku.split("_")[0]] = { count: 1, product: i,title: i.lazada_sku.split("_")[0]};
			} else {
			counts[i.lazada_sku.split("_")[0]].count =
				(counts[i.lazada_sku.split("_")[0]].count || 1) + 1;
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
			pieThis.titles.push(counts[z].product.seller_sku.split("-").slice(0, -1).join('-'));
			pieThis.colors.push(this.getRandomColor());
			pieThis.img.push(counts[z].product.item_info ? counts[z].product.item_info.product_img : "https://dummyimage.com/600x600/ffffff/000000.jpg&text=NO+IMG");
			pieThis.url.push(counts[z].product.item_info ? counts[z].product.item_info.product_url : "https://lazada.co.th/sn-fashion");
		}
		//endTop

		let countsSKUs = {};
		this.state.resultOrderItem.forEach(i => {
			// countFlattenTransaction[ i.shop_sku.split("_")[0] ].count = countFlattenTransaction[ i.shop_sku.split("_")[0] || 0 +=1
			if (typeof countsSKUs[i.lazada_sku] === "undefined") {
				countsSKUs[i.lazada_sku] = { count: 1, product: i, title: i.lazada_sku };
			} else {
				countsSKUs[i.lazada_sku].count =
				(countsSKUs[i.lazada_sku].count || 1) + 1;
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
			pieThisSKUs.labels.push(z);
			pieThisSKUs.values.push(countsSKUs[z].count);
			pieThisSKUs.titles.push(countsSKUs[z].product.seller_sku);
			pieThisSKUs.colors.push(this.getRandomColor());
			pieThisSKUs.img.push(countsSKUs[z].product.item_info ? countsSKUs[z].product.item_info.product_img : "https://dummyimage.com/600x600/ffffff/000000.jpg&text=NO+IMG");
			pieThisSKUs.url.push(countsSKUs[z].product.item_info ? countsSKUs[z].product.item_info.product_url : "https://lazada.co.th/sn-fashion");
		}

		console.log(countsSKUs);

		//count Date
		let countsDate = {};
		this.state.resultOrderItem.forEach(i => {
			// countFlattenTransaction[ i.shop_sku.split("_")[0] ].count = countFlattenTransaction[ i.shop_sku.split("_")[0] || 0 +=1
			const groupThis = moment(i.order_info.created_at).format("LL");
			console.log(groupThis);
			if (typeof countsDate[groupThis] === "undefined") {
				countsDate[groupThis] = { count: 1, product: i };
			} else {
				countsDate[groupThis].count =
				(countsDate[groupThis].count || 1) + 1;
			}
		});

		let orderedcountsDate = [];
		for (let z in countsDate) {
			orderedcountsDate.push(countsDate[z])
		}

		orderedcountsDate.sort((a,b) => b.count - a.count);
		countsDate = orderedcountsDate;

		console.log(countsDate);

		// let pieThisSKUs = {
		// 	labels : [],
		// 	values : [],
		// 	titles : [],
		// 	colors: [],
		// 	img : [],
		// 	url : [],
		// }
		// for (let z in countsSKUs) {
		// 	pieThisSKUs.labels.push(z);
		// 	pieThisSKUs.values.push(countsSKUs[z].count);
		// 	pieThisSKUs.titles.push(countsSKUs[z].product.seller_sku);
		// 	pieThisSKUs.colors.push(this.getRandomColor());
		// 	pieThisSKUs.img.push(countsSKUs[z].product.item_info ? countsSKUs[z].product.item_info.product_img : "https://dummyimage.com/600x600/ffffff/000000.jpg&text=NO+IMG");
		// 	pieThisSKUs.url.push(countsSKUs[z].product.item_info ? countsSKUs[z].product.item_info.product_url : "https://lazada.co.th/sn-fashion");
		// }


		this.setState({chartTopSellArray : pieThis, chartAllSKUsArray : pieThisSKUs, isLoading: false});
	}

	prepareChartOrderNo = () => {
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
		
		resultTransactions.sort(function(a, b) {
			return moment.utc(a.items[0].order_info.created_at).diff(moment.utc(b.items[0].order_info.created_at))
		});

		for (let z in resultTransactions) {
			arraySaveThis.cost.push(Math.abs(resultTransactions[z].product_cost));
			arraySaveThis.profit.push(resultTransactions[z].profit);
			arraySaveThis.revenue.push(resultTransactions[z].itemPriceCredit);
			arraySaveThis.paymentFee.push(Math.abs(resultTransactions[z].paymentFee));
			arraySaveThis.shippingFeePaidByCustomer.push(resultTransactions[z].shippingFeePaidByCustomer);
			arraySaveThis.shippingFeeChargedByLAZ.push(Math.abs(resultTransactions[z].shippingFeeChargedByLAZ));
			arraySaveThis.promotionalFlexi.push(Math.abs(resultTransactions[z].promotionalFlexi));
			arraySaveThis.promotionalVoucher.push(Math.abs(resultTransactions[z].promotionalVoucher));

			arraySaveThis.createdAt.push(resultTransactions[z].items[0].order_info.created_at);
			arraySaveThis.orderNo.push(resultTransactions[z].items[0].order_no)
		}




		this.setState({chartOrderNoArray : arraySaveThis}, () => {
			
		});
	}

 
	//INPUT
	sideList = side => (
		<div
			role="presentation"
			// onClick={this.toggleDrawer(side, false)}
			onKeyDown={this.toggleDrawer(side, false)}
			className="p-4"
		>
			<div className="d-flex flex-column justify-content-center align-items-center">
				<div className="d-flex justify-content-around flex-column">
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
				<Divider />
				<div className="align-self-start my-5">
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
				
				<Button
					variant="contained"
					color="primary"
					fullWidth={true}
					onClick={() => {
						this.getData();
						this.toggleDrawer("left", false);
					}}
				>
					Submit
				</Button>
				<Divider />
				<Button variant="contained" className="my-5" fullWidth={true} color="secondary" component={RouterLink} to="/success">
					แก้ไข Cost | Edit Cost
				</Button>
			</div>
		</div>
	);

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
		if (
			event &&
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}

		this.setState({ left: open });
	};
	//INPUT

	


	render() {
		if (this.state.isLoading) {
			return (
				<div className="container d-flex vh-100 justify-content-center">
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
			
			
				<div className="bg-light container">
					<Button className="position-fixed" variant="contained" color="primary" style={{top:"35%",left:10}} onClick={this.toggleDrawer("left", true)}><h3>แก้ไขผลแสดง</h3></Button>
					<div className="d-flex justify-content-around align-items-center p-5 box-shadow">
						<h5 className="text-secondary">From Date : </h5>
						<h5>{this.state.startDateUserSelect}</h5>
						<h5 className="text-secondary">To Date : </h5>
						<h5>{this.state.endDateUserSelect}</h5>
					</div>
					<br></br>
					<h6 className="text-danger">แสดงจากการจ่ายเงินของ Lazada โดยถ้า Lazada จ่ายมาแล้วถึงแสดง ทั้งนี้ Order นั้นอาจเกิดขึ้นก่อนวันที่เลือกก็ได้.</h6>

					<div className="row d-flex justify-content-between align-items-center">
						<div className="col-9">
							<FinancialChartMixed resultData={this.state.chartOrderNoArray} />
						</div>
						<div className="col-3">
							<List disablePadding dense component={Paper}>
								<ListText primary={"฿ " + this.state.wideFinancial.itemPriceCredit} secondary="Revenue" divider={true}/>
								<ListText primary={"฿ " + this.state.wideFinancial.paymentFee} secondary="Payment Fee" divider={true}/>
								<ListText primary={"฿ " + this.state.wideFinancial.product_cost} secondary="Cost" divider={true} />
								<ListText primary={"฿ " + this.state.wideFinancial.profit} secondary="Profit" divider={true}/>
								<ListText primary={"฿ " + this.state.wideFinancial.promotionalFlexi} secondary="Promotional Flexi" divider={true}/>
								<ListText primary={"฿ " + this.state.wideFinancial.promotionalVoucher} secondary="Promotional Voucher" divider={true}/>
								<ListText primary={"฿ " + this.state.wideFinancial.shippingFeeChargedByLAZ} secondary="Shipping Fee Charged By Lazada" divider={true}/>
								<ListText primary={"฿ " + this.state.wideFinancial.shippingFeePaidByCustomer} secondary="Shipping Fee Paid By Customer" divider={true}/>
							</List>
						</div>
					</div>
					
					<SwipeableDrawer
						open={this.state.left}
						onClose={this.toggleDrawer("left", false)}
						onOpen={this.toggleDrawer("left", true)}
					>
						{this.sideList("left")}
					</SwipeableDrawer>

					<div className="row d-flex align-items-center justify-content-around">
						<SmallChart title="Revenue - ยอดขาย" label={this.state.chartOrderNoArray.createdAt} point={this.state.chartOrderNoArray.revenue} orderNo={this.state.chartOrderNoArray.orderNo} />
						<SmallChart title="Cost - ต้นทุน" label={this.state.chartOrderNoArray.createdAt} point={this.state.chartOrderNoArray.cost} orderNo={this.state.chartOrderNoArray.orderNo} />
						<SmallChart title="Profit - กำไร" label={this.state.chartOrderNoArray.createdAt} point={this.state.chartOrderNoArray.profit} orderNo={this.state.chartOrderNoArray.orderNo} />
					</div>

					<TopProductPie resultData={this.state.chartTopSellArray} title="Top Selling By Product"/>
					<TopProductPie resultData={this.state.chartAllSKUsArray} title="Top Selling By SKU"/>
					
				</div>
			
		);
	}
}
