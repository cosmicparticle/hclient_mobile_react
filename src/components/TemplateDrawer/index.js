import { Button, Checkbox, Drawer, List, Toast } from 'antd-mobile';
import React, { Component } from 'react';
import Super from './../../super';
import './index.less';
import SearchForm from "../SearchForm";
const CheckboxItem = Checkbox.CheckboxItem;

export default class TemplateDrawer extends Component {

	componentDidMount() {
		this.props.onRef(this)
	}
	state = {
		checkboxdata: [],
		fieldWords: "",
		showDrawer: false,
		showSearchDrawer:false,
		isEndList:false,
		templateData: [],
		pageInfo:{pageNo:1,pageSize:10}
	}
	onOpenChange = (item) => {
		let {menuId} = this.props
		let {fieldWords,showDrawer} = this.state
		const templateGroupId = item.id
		let newfields = []
		let fields=[];
		if(item.fields) { //获取字段名称
			item.fields.forEach((item) => {
				newfields.push(item.id)
			})
			if(!fieldWords) {
				fieldWords = newfields.join(",")
			}
			if(fieldWords && fieldWords !== newfields.join(",")) {
				fieldWords = newfields.join(",")
			}
		}
		let excepts
		let arr=[]
		if(item.lists && item.lists.length > 0) { //获取排除的code
			item.lists.forEach((item) => {
				arr.push(item.code)
			})
			excepts=arr.join(",")
		}
		if(showDrawer) {
			this.setState({
				showDrawer: false,
				excepts,
			});
		} else {
			Super.super({
				url:`api2/meta/tmpl/${menuId}/stmpl/detailGroup/${templateGroupId}`,
				method:"GET",
			}).then((res) => {
				const fieldIds=[]
				res.config.criterias.forEach((item)=>{
					if(item.inputType==="select"){
						fieldIds.push(item.fieldId)
					}
					const criteriaValueMap=res.criteriaValueMap
					for(let k in criteriaValueMap){
						if(k===item.id.toString()){
							item.value=criteriaValueMap[k]
						}
					}
				})
				fields=res.config.columns;
				this.setState({
					showDrawer: true,
					templateGroupId,
					excepts,
					fieldWords,
					menuId,
					checkboxdata: [],
					fields,
					searchList: res.config.criterias,
					searchFieldIds:fieldIds,
					addModal:item
				})
				this.requestList({menuId,templateGroupId,excepts,fields});
			})
		}
	}

	requestList = (param) =>{
		// let menuId=param.menuId?param.menuId:this.state.menuId;
		// let templateGroupId=param.templateGroupId?param.templateGroupId:this.state.templateGroupId;
		// let excepts=param.excepts?param.excepts:this.state.excepts;
		let criterias=param.criterias?param.criterias:{};
		// let fields=param.fields?param.fields:this.state.fields;
		const {menuId,templateGroupId,excepts,fields}=this.state;
		criterias.excepts=excepts;

		Super.super({
			url:`api2/entity/${menuId}/selector/key/detailGroup/${templateGroupId}`,
			method:"GET",
			query:criterias
		}).then((res)=>{
			let pageInfo={pageNo:criterias.pageNo?criterias.pageNo:1,pageSize:criterias.pageSize?criterias.pageSize:10}
			this.goPage(res.queryKey,pageInfo,fields)
		})
	}

	nextPage=(queryKey,incre)=>{

		let increment=incre?incre:1;
		const pageInfo=this.state.pageInfo;
		pageInfo.pageNo=pageInfo.pageNo+incre;
		this.goPage(queryKey,pageInfo);

	}

	goPage = (queryKey,pageInfo,fields_) => {
		let fields=fields_?fields_:this.state.fields;
		console.log(fields);
		console.log(fields_);
		Super.super({
			url: `api2/entity/list/${queryKey}/data`,
			method:'GET',
			query: pageInfo
		}).then((res) => {
			res.entities.forEach((item)=>{
				item.lists=[]
				for(let k in item.cellMap){
					fields.forEach((it,index)=>{
						if(it.id.toString()===k){
							const lis={
								code:item.code,
								value:item.cellMap[k],
								title:it.title,
								key:item.code+index
							}
							item.lists.push(lis)
						}
					})
				}
			})
			this.setState({
				templateData: res.entities,
				showDrawer: true,
				pageInfo:res.pageInfo,
				isEndList:res.isEndList,
				queryKey
			})
		})
	}

	handleDrawerOk = () => {
		const {checkboxdata,fieldWords,templateGroupId,menuId,addModal} = this.state
		const codes = checkboxdata.join(",")
		Super.super({
			url: `api2/entity/${menuId}/selecteor/selected/data/detailGroup/${templateGroupId}`,
			method:'GET',
			query: {
				codes,
				dfieldIds: fieldWords,
			}
		}).then((res) => {
			if(res.status === "suc") {
				this.props.loadTemplate(res.entities,addModal)
				this.setState({
					showDrawer: false,
				})
			} else {
				Toast.error(res.status)
			}
		})
	}
	changeCheckbox = (value) => {
		const {checkboxdata} = this.state
		if(checkboxdata.length === 0) {
			checkboxdata.push(value)
		} else {
			let flag = -1
			checkboxdata.forEach((item, index) => {
				if(item === value) {
					flag = index
				}
			})
			if(flag !== -1) {
				checkboxdata.splice(flag, 1)
			} else {
				checkboxdata.push(value)
			}
		}
		this.setState({
			checkboxdata,
		})
	}


	onOpenChange_search = () => {
		const {showSearchDrawer} = this.state
		//console.log(showDrawer);
		this.setState({
			showSearchDrawer: !showSearchDrawer
		});
		if(showSearchDrawer) { //固定页面
			document.removeEventListener('touchmove', this.bodyScroll, {
				passive: false
			})

		} else {
			document.addEventListener('touchmove', this.bodyScroll, {
				passive: false
			})
			this.getSearchOptions();
		}
	}

	getSearchOptions = () => {
		const {searchFieldIds} = this.state;
		if(searchFieldIds.length > 0) {
			Super.super({
				url:`api2/meta/dict/field_options`,
				data:{
					fieldIds:searchFieldIds
				}
			},).then((res)=>{
				this.setState({
					optArr:res.optionsMap
				})
			})
		}
	}

	handleSearch1 = (values) => {


		this.setState({
			isSearchQuery:true,
		});

		this.onOpenChange_search();
		//this.getSearchOptions();
		this.requestList({criterias:values});

		//this.onOpenChange(values);

	}
	
	render() {
		const {showDrawer,pageInfo,isEndList,templateData,queryKey,showSearchDrawer,searchList,optArr} = this.state
		const totalPage = pageInfo ?pageInfo.virtualEndPageNo: "";
		const searchSidebar = (<SearchForm
			 searchList={searchList}
			 optArr={optArr}
			 onOpenChange={this.onOpenChange_search}
			handleSearch={this.handleSearch1}
			/>);
		let sidebar = (<div className="sideBar">
                        <div className="drawerBtns">
                            <p>{pageInfo?<span>第{pageInfo.pageNo}页</span>:""}</p>
							<p>{pageInfo&&pageInfo.pageNo!==1?<span onClick={()=>this.nextPage(queryKey,-1)}>上一页</span>:null}</p>
                            <Button type="warning" inline size="small" onClick={this.onOpenChange}>取消</Button>
                            <Button type="primary" inline size="small" onClick={this.handleDrawerOk}>确定</Button>
							<Button type="primary" inline size="small" onClick={this.onOpenChange_search}>筛选</Button>
                        </div>
                        {
                            templateData?templateData.map(item =>
                                <List key={item.code}>
									<CheckboxItem onChange={() => this.changeCheckbox(item.code)}>
										{item.lists.map(it =>
											<List.Item inline wrap={true} key={it.key}>{it.title}&nbsp;:&nbsp;{it.value}</List.Item>
										)}
									</CheckboxItem>
								</List>
                            ):""
                        }
                        {isEndList===false?
                        <Button onClick={()=>this.nextPage(queryKey,+1)}>点击加载下一页</Button>:
                        <p className="nomoredata">没有更多了···</p>}
                    </div>)
		return(
			<div>
				<Drawer
					className={showDrawer?"openDrawer":"shutDraw"}
					style={{ minHeight: document.documentElement.clientHeight-45 }}
					contentStyle={{ color: '#A6A6A6', textAlign: 'center', paddingTop: 42 }}
					sidebar={sidebar}
					open={showDrawer}
					position="right"
					touch={false}
					enableDragHandle
					onOpenChange={this.onOpenChange}
				>
					&nbsp;
				</Drawer>
				<Drawer
					className={showSearchDrawer?"openDrawer":"shutDraw"}
					style={{ minHeight: document.documentElement.clientHeight-45 }}
					enableDragHandle
					contentStyle={{ color: '#A6A6A6', textAlign: 'center', paddingTop: 42 }}
					sidebar={searchSidebar}
					open={showSearchDrawer}
					position="right"
					touch={false}
					onOpenChange={this.onOpenChange_search}
				>
					&nbsp;
				</Drawer>
			</div>


		)
	}
}