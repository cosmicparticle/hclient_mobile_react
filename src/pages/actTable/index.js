import { ActivityIndicator, Button, Card, Drawer, List, Modal, Popover, Toast, } from 'antd-mobile';
import React, { Component } from 'react';
import Nav from './../../components/Nav';
import SearchForm from './../../components/SearchForm';
import Super from './../../super';
import Units from './../../units';
import './index.less';
import Storage from './../../units/storage'
const Item = List.Item;
const Itempop = Popover.Item;
const alert = Modal.alert;

export default class ActTable extends Component {

	state = {
		menuTitle: '',
		showDrawer: false,
		searchList: [],
		optArr: {},
		animating: false,
        isPagedQuery:false,
		isEndList:false,
		isHistory:false,
		menuId:this.props.match.params.menuId,
		searchwords:{pageNo:1,pageSize:10}
	}
	componentDidMount() {
		const {menuId}=this.state
		const url=decodeURI(this.props.history.location.search)
		this.pushUrl(menuId,url,true);
	}

	pushUrl=(menuId,url,isPushUrl)=>{
		let {searchwords}=this.state;
		let pageInfo=url?Units.urlToObj(url):searchwords;
		//this.props.history.push(`/${menuId}?pageNo=${pageInfo.pageNo?pageInfo.pageNo:1}&pageSize=${pageInfo.pageSize?pageInfo.pageSize:10}`)
		if(url) {
			this.requestList(menuId,pageInfo,isPushUrl)
		} else {
			Storage[`${menuId}`]=null //刷新列表数据
			this.requestList(menuId,null,isPushUrl)
		}
}

	componentWillUnmount() {
		clearTimeout(this.closeTimer);
	}
	componentWillReceiveProps(nextProps){
		// const {menuId} = nextProps.match.params
		// let urlParam=this.props.history.location.search;
		// let nextParam=nextProps.location.search;
		// const url = decodeURI(this.props.history.location.search) //获取url参数(页码)，并解码
		//  let {isHistory}=this.state;
		// // let pageInfo=url?Units.urlToObj(url):searchwords;
		//  if(urlParam!=nextParam){
		// 	this.pushUrl(menuId,url,true);
		// }
		 //else{
		// 	this.setState({
		// 		isHistory:true,
		// 	});
		// }
	}
	//isPushUrl=true时，后退获得的url已有参数，不需要push链接,不然会报错
	requestList = (menuId, searchwords_, isPushUrl) => {
		this.setState({
			animating: true
		})
		let searchwords=searchwords_?searchwords_:this.state.searchwords;

		Super.super({
			url: `api2/entity/${menuId}/list/tmpl`,
			method:'GET',
			query:searchwords,
		}).then((res) => {
			document.removeEventListener('touchmove', this.bodyScroll, {
				passive: false
			})
			if(res) {
				const fieldIds=[]
				res.ltmpl.criterias.forEach((item)=>{
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
				window.scrollTo(0, 0)
				this.setState({
					menuTitle: res.menu.title,
					listLtmpl: res.ltmpl.columns,
					searchList: res.ltmpl.criterias,
					showDrawer: false,
					searchFieldIds:fieldIds,
					animating: false,
					tmplGroup:res.tmplGroup,
					queryKey:res.queryKey,
					searchwords:searchwords,
				})
				// if(Storage[`${menuId}`] && !data){
				// 	const res= Storage[`${menuId}`]
				// 	this.sessionTodo(res)
				// }else{
				// let pageInfo=searchwords;
					this.queryList(searchwords,isPushUrl);
				//}
			}
		 })
	}
	queryList=(searchwords,isPushUrl)=>{
        const {menuId,queryKey,}=this.state
		const searchStr=Units.queryParams(searchwords);
		if(!isPushUrl){
			this.props.history.push(`/${menuId}?${searchStr}`)
		}
		Super.super({
			url:`api2/entity/list/${queryKey}/data`,
			method:'GET',
			query:searchwords
		}).then((res)=>{
			Storage[`${menuId}`]=res
			this.sessionTodo(res)
		})          
	}
	sessionTodo=(data)=>{
		const {listLtmpl}=this.state
		let isStat=true
        data.entities.forEach((item)=>{
			item.fields=[]
			listLtmpl.forEach((it)=>{
				for(let k in item.cellMap){
					if(it.title==="操作"){
						isStat=false
					}
					if(k===it.id.toString()){
						const list={
							title:it.title,
							value:item.cellMap[k],
						}
						item.fields.push(list)
					}
				}
			})
		})

        this.setState({
			list:data.entities,
			isStat,//判断列表是否是统计页
			searchwords:{...this.state.searchwords,pageNo:data.pageInfo.pageNo,pageSize:data.pageInfo.pageSize},
			isEndList:data.isEndList,
           // currentPage:data.pageInfo.pageNo,
			isSeeTotal:undefined,
            Loading:false,
        })
    }
	handlePop = (value) => {
		const {menuId} = this.state
		if(value === "search") {
			this.onOpenChange()
			this.getSearchOptions()
		}else if(value === "create") {
			this.props.history.push(`/create/${menuId}`)
		}else{
			this.props.history.push(`/${value}`)
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
	cardClick = (code) => {
		const {menuId} = this.state
		this.props.history.push(`/${menuId}/${code}`)
	}
	bodyScroll = (e) => {
		e.preventDefault();
	}
	onOpenChange = () => {
		const {showDrawer} = this.state
		//console.log(showDrawer);
		this.setState({
			showDrawer: !showDrawer
		});
		// if(showDrawer) { //固定页面
		// 	document.removeEventListener('touchmove', this.bodyScroll, {
		// 		passive: false
		// 	})
		// } else {
		// 	document.addEventListener('touchmove', this.bodyScroll, {
		// 		passive: false
		// 	})
		// }
	}
	nextPage = (no) => {
		const {menuId,searchwords} = this.state
		let pageInfo = {}
		pageInfo.pageSize = searchwords.pageSize
		// for(let k in searchwords) {
		// 	if(searchwords[k]) {
		// 		data[k] = searchwords[k]
		// 	}
		// }
		const topageNo = searchwords.pageNo + no
		pageInfo.pageNo = topageNo
		this.queryList(pageInfo);
		//this.requestList(menuId, data)
		window.scrollTo(0, 0)
	}
	handleSearch = (values) => {
		const {menuId} = this.state
		this.requestList(menuId,values)
	}
	showAlert = (code, e) => {
		e.stopPropagation()
		const alertInstance = alert('删除操作', '确认删除这条记录吗???', [{
				text: '取消'
			},
			{
				text: '确认',
				onPress: () => this.handelDelete(code)
			},
		]);
		setTimeout(() => {
			// 可以调用close方法以在外部close
			alertInstance.close();
		}, 10000);
	};
	handelDelete = (code) => {
		const {menuId} = this.state
		Super.super({
			url: `api2/entity/${menuId}/detail`,
			method:'DELETE',
			data: {
				codes: code
			}
		}).then((res) => {
			this.setState({
				loading: false,
				Loading: false
			})
			if(res.status === "suc") {
				Toast.success("删除成功！") //刷新列表 
				this.requestList(menuId,code)
			} else {
				Toast.info('删除失败！')
			}
		})
	}
	seeTotal=()=>{
        const {queryKey,isSeeTotal}=this.state
        if(!isSeeTotal){
            Super.super({
                url:`api2/entity/list/${queryKey}/count`,
				method:'GET',
            }).then((res)=>{
                this.setState({
                    isSeeTotal:res.count
                })
            })
        }       
    }
	render() {
		const {menuTitle,list,showDrawer,searchList,optArr,searchwords,isEndList,animating,isSeeTotal,isStat,tmplGroup} = this.state
		const data =Storage.menuList
		let actPop;

		const hideCreateButton=tmplGroup?tmplGroup.hideCreateButton:null;
		const hideDeleteButton=tmplGroup?tmplGroup.hideDeleteButton:null;
		const hideQueryButton=tmplGroup?tmplGroup.hideQueryButton:null;
		actPop = [
			(<Itempop key="5" value="home" icon={<span className="iconfont">&#xe62f;</span>}>首页</Itempop>),
			(<Itempop key="1" value="user" icon={<span className="iconfont">&#xe74c;</span>}>用户</Itempop>),
			(<Itempop key="2" value="login" icon={<span className="iconfont">&#xe739;</span>}>退出</Itempop>),
		]
		if(isStat){

		}else{

		}

		if(!hideCreateButton){
			actPop.push(<Itempop key="4" value="create" icon={<span className="iconfont">&#xe60a;</span>}>创建</Itempop>);
		}
		if(!hideQueryButton) {
			actPop.push(<Itempop key="3" value="search" icon={<span className="iconfont">&#xe72f;</span>}>筛选</Itempop>);
		}

		const sidebar = (<SearchForm 
                            searchList={searchList} 
                            optArr={optArr}
							onOpenChange={this.onOpenChange}
                            handleSearch={this.handleSearch}            
                        />);
		return(
			<div className="actTable">
            <Nav 
                title={menuTitle} 
                data={data}
                handleSelected={this.handlePop}
                pops={actPop}
                />
                <div className="topbox">                    
                    {searchwords && searchwords.pageNo!==1?
                    <Button size="small" inline onClick={()=>this.nextPage(-1)}>
                    上一页</Button>:""}                   
                    <span className="pageNo">
						{searchwords?`第${searchwords.pageNo}页，`:""}
						{isSeeTotal!==undefined?`共${isSeeTotal}条`:<span onClick={this.seeTotal}>点击查看总数</span>}
                    </span>
                </div>
                {
                    list?list.map((item,index)=>
                        <Card key={item.code} onClick={isStat?()=>Toast.info("无详情页"):()=>this.cardClick(item.code)}>
                                    <Card.Header
										title={<span style={{color:"#ccc"}}>
											{searchwords?((searchwords.pageNo-1)*searchwords.pageSize+index+1):""}
										</span>}

                                        extra={isStat || hideDeleteButton?null:<span
                                            className="iconfont" 
                                            onClick={(e)=>this.showAlert(item.code,e)}
                                            >&#xe676;</span>}
                                    />
                                    <Card.Body>
                                        <List>
                                            {item.fields?item.fields.map(it =>
                                                <Item key={it.title} extra={it.value?it.value.indexOf("@R@")>0?it.value.split("@R@")[1]:it.value:it.value}>{it.title}&nbsp;:</Item>
                                            ):""}
                                        </List>
                                    </Card.Body>
                                </Card>
                    ):""
                }
                {isEndList===false?
					<Button onClick={()=>this.nextPage(+1)}>点击加载下一页</Button>:
					<p className="nomoredata">没有更多了···</p>}
                <Drawer
                    className={showDrawer?"openDrawer":"shutDraw"}
                    style={{ minHeight: document.documentElement.clientHeight-45 }}
                    enableDragHandle
                    contentStyle={{ color: '#A6A6A6', textAlign: 'center', paddingTop: 42 }}
                    sidebar={sidebar}
                    open={showDrawer}
                    position="right"
                    touch={false}
                    onOpenChange={this.onOpenChange}
                >
                &nbsp;
                </Drawer>
                <ActivityIndicator
                    toast
                    text="加载中..."
                    animating={animating}
                />
            </div>
		)
	}
}