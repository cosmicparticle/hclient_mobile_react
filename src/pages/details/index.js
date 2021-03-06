import React, {Component} from 'react'
import { List, Toast, Popover, ActivityIndicator, Modal, Button, } from 'antd-mobile';
import { createForm } from 'rc-form';
import Nav from './../../components/Nav'
import Super from './../../super'
import DivFormCard from './../../components/FormCard/divformcard'
import Units from './../../units'
import TemplateDrawer from './../../components/TemplateDrawer'
import EditList from './../../components/FormCard/editList'
import RabcTemplateDrawer from './../../components/RabcTemplateDrawer'
import Storage from './../../units/storage'
import './index.less'
const Itempop = Popover.Item;
const alert = Modal.alert;

class Details extends Component {

	state = {
		itemList: [],
		optionsMap:{},
		animating: false,
		headerName: "",
		visibleNav: false,
		scrollIds: [],
		premises:[],
		isDrawer:this.props.match?false:true,
		menuId:this.props.match?this.props.match.params.menuId:this.props.menuId,
		code:this.props.match?this.props.match.params.code:this.props.code,
		fieldGroupId:this.props.match?null:this.props.fieldGroupId,
		valueChangedItemNameList:[]
	}
	componentDidMount() {
		if(this.props.menuId==="user"){
			this.props.onRef(this)
		}
		window.addEventListener('scroll', this.handleScroll);
		this.loadRequest()
	}
	handleScroll = () => {
		const {scrollIds} = this.state
		const scrollY = window.scrollY
		const mainTopArr = [];
		let k = 0;
		if(scrollIds) { // 滑动锁定导航
			for(let i = 0; i < scrollIds.length; i++) {
				let node = document.getElementById(scrollIds[i])
				if(node) {
					let top = Math.floor(node.offsetTop)
					mainTopArr.push(top);
				}
			}
			mainTopArr.sort((a, b) => a - b) // 排序
			const fixedDiv = document.getElementsByClassName("fixedDiv")
			for(let i = 0; i < mainTopArr.length; i++) {
				if((scrollY + 45) > mainTopArr[i]) {
					k = i
					for(let i = 0; i < fixedDiv.length; i++) {
						fixedDiv[i].style.display = "none"
					}
					fixedDiv[k].style.display = "block"
				}
				if(scrollY <= 5) {
					k = -1
					for(let i = 0; i < fixedDiv.length; i++) {
						fixedDiv[i].style.display = "none"
					}
				}
			}
		}

		const lis = document.getElementsByClassName("am-list-header")
		if(lis && mainTopArr.length > 0) {
			for(let i = 0; i < lis.length; i++) {
				lis[i].style.position = "static"
			}
			if(k >= 0) {
				lis[k].style.position = "fixed"
				lis[k].style.top = "45px"
				lis[k].style.zIndex = "78"
				lis[k].style.background = "#F5F5F9"
			}
		}
	}
	formItemValueOnChange=(name)=>{
		this.state.valueChangedItemNameList.push(name);
	}

	loadRequest = () => {
		const {menuId,fieldGroupId} = this.state
		this.setState({
			animating: true
		});
		let url
		if(fieldGroupId){
			url =`api2/meta/tmpl/${menuId}/dtmpl/rabc/${fieldGroupId}`
		}else{
			url =`api2/meta/tmpl/${menuId}/dtmpl/normal/`
		}
		Super.super({url,method:"GET",}).then((res) => {
			const premises=res.config.premises
			const menuTitle=res.menu?res.menu.title:null
			const buttonStatus=res.config.buttonStatus
			const actions=res.config.actions
			const {scrollIds}=this.state
			if(premises && premises.length>0){
				scrollIds.push("默认字段（不可修改）")
				this.setState({
					premises,
					scrollIds,
				})
			}
			let dtmplGroup=this.requestSelect(res.config.dtmpl.groups)
			this.setState({
				buttonStatus,
				actions
			})
			this.loadData(dtmplGroup,menuTitle)				
		})
	}	
	loadData=(dtmplGroup,menuTitle)=>{
		const {menuId,code,fieldGroupId}=this.state
		if(code){
			Super.super({
				url:`api2/entity/${menuId}/detail/${code}`,
				method:'GET',
				query:{
					fieldGroupId
				}       
			}).then((resi)=>{
				const fieldMap=Units.forPic(resi.entity.fieldMap)  
				const arrayMap=resi.entity.arrayMap
				const dataTitle=resi.entity.title

				for(let i in arrayMap){
					arrayMap[i].forEach((item)=>{
						item.fieldMap.code=item.code
					})
				}
				this.loadDataToList(dtmplGroup,fieldMap,arrayMap)	
				this.setState({
					headerName: `${menuTitle}-${dataTitle}-详情`,
				})	
			})	
		}else{
			this.loadDataToList(dtmplGroup) // 没有code，就是创建，没有值
			this.setState({
				headerName:menuId==="user"?"用户":`${menuTitle}-创建`,
			})
		}
			
	}
	loadDataToList=(dtmplGroup,fieldMap,arrayMap)=>{
		dtmplGroup.forEach((item)=>{
			let flag=false // 是否添加关系
			const relaOptions = []
			if(item.composite){
				const model=item.fields
				const totalname=item.composite.cname
				item.lists=[]
				item.limitLen=1
				for(let k in arrayMap){
					if(k===item.id.toString()){
						item.lists.push(...arrayMap[k])
					}
				}
				if(item.composite.addType===5){
					flag=true
					item.composite.relationSubdomain.forEach((item) => {
						const list = {
							title:item,
							value:item,
							label:item,
						}
						relaOptions.push(list)
					})
				}
				item.lists.forEach((it,index)=>{
					it.list=[]
					const deletebtn = {
						type:"deletebtn",
						code:it.code,
						name:`deletebtn[${index}]`
					}
					it.list.push(deletebtn)
					if(flag){
						const relation = {
							type:"relation",
							value:it.relationLabel,
							title:"关系",
							fieldId:item.composite.c_id,
							validators:"required",
							name:`${totalname}[${index}].关系`,
							relationSubdomain:relaOptions,							
						}
						it.list.push(relation)
					}					

						model.forEach((i)=>{
							for(let k in it.fieldMap){
							if(k===i.id.toString()){
								const lastname=i.name.split(".")[1]
								const record={
									name:`${totalname}[${index}].${lastname}`,
									title:i.title,
									type:i.type,
									validators:i.validators,
									fieldId:i.fieldId,
									value:it.fieldMap[k],
									code:it.fieldMap.code,
									fieldAvailable:it.fieldAvailable,
								}
								it.list.push(Units.forPic(record))
							}
						}
					})
				})
			}else{				
				item.limitLen=4
				item.fields.forEach((it)=>{
					for(let k in fieldMap){
						if(it.id.toString()===k){
							it.value=fieldMap[k]
						}
					}
				})
			}
		})
	}
	requestSelect = (dtmplGroup) => {
		const {scrollIds}=this.state
		const selectId = []
		dtmplGroup.forEach((item) => {
			item.fields.forEach((it) => { 
				if(it.type === "select" || it.type === "label") {
					selectId.push(it.fieldId)
				}
			})
		})
		dtmplGroup.forEach((item) => {
			scrollIds.push(item.title)
		})
		if(selectId.length>0){
			Super.super({
				url:`api2/meta/dict/field_options`,       
				data:{
					fieldIds:selectId.join(',')
				},
			}).then((res)=>{
				const optionsMap=res.optionsMap
				for(let k in optionsMap){

					if(optionsMap[k]!=null){
						optionsMap[k].forEach((item)=>{
							
							item.label=item.title

				})
					}
					
					
				}
				this.setState({
					optionsMap,
					scrollIds,
					dtmplGroup,
					animating: false,
				})
			})	
		}else{
			this.setState({
				scrollIds,
				dtmplGroup,
				animating: false,
			})
		}
		return dtmplGroup
	}
	addList = (list) => {
		const {dtmplGroup}=this.state
		const record=[]
		const relaOptions = []
		let flag=false // 是否添加关系
		const totalname=list.composite.cname
		// const code=Units.RndNum(9)
		const code=list.code?list.code:Units.RndNum(9);
		const len=list.lists.length
		if(list.composite){
			const deletebtn = {
				type:"deletebtn",
				code,
				name:`deletebtn[${len}]`
			}
			record.push(deletebtn)
			if(list.composite.addType===5){				
				flag=true
				list.composite.relationSubdomain.forEach((item) => {
					const li = {
						title:item,
						label:item,
						value:item
					}
					relaOptions.push(li)
				})
			}
			if(flag){
				const len=list.lists.length
				const relation = {
					type:"relation",
					value:relaOptions.length===1?relaOptions[0].value:"",
					title:"关系",
					fieldId:list.composite.c_id,
					validators:"required",
					name:`${totalname}[${len}].关系`,
					relationSubdomain:relaOptions,							
				}
				record.push(relation)
			}	
		}
		list.fields.forEach((item)=>{
			const lastname=item.name.split(".")[1]
			const re={
				code,
				fieldAvailable:item.fieldAvailable,
				fieldId:item.fieldId,
				name:`${totalname}[${len}].${lastname}`,
				title:item.title,
				type:item.type,
				validators:item.validators,
				value:item.value
			}
			record.push(re)
		})
		
		const res={
			list:record,
			code
		}
		//如果之前已存在，如编辑的情况，移除原本的数据
		this.deleteList(code,true);
		list.lists.unshift(res)
		dtmplGroup.forEach((item,index)=>{
			if(item.id===list.id){
				dtmplGroup.splice(index,list)
			}
		})
		this.setState({
			dtmplGroup
		})
	}
	handleSubmit = (actionId) => {
		const {code,menuId,dtmplGroup,fieldGroupId,valueChangedItemNameList}=this.state
		this.setState({animating: true});
		this.props.form.validateFields({force: true}, (err, values) => { // 提交再次验证
			if(!err){
				dtmplGroup.forEach((item)=>{
					if(item.composite){
						values[`${item.composite.cname}.$$flag$$`] = true
						valueChangedItemNameList.push(`${item.composite.cname}.$$flag$$`);
					}
				})
				for(let k in values){
					if(values[k] && values[k] instanceof Date){ // 判断时间格式
						if(!valueChangedItemNameList.includes(k)){//不修改不提交
							delete values[k]
						}else{
							values[k]=Units.dateToString(values[k])
						}

					}else if(values[k] && typeof values[k] === "object" && Array.isArray(values[k])){
						const totalName = k
						values[k].forEach((item, index) => {
							for(let e in item) {
								if(e === "关系") {
									e = "$$label$$"
									values[`${totalName}[${index}].${e}`] = item["关系"]
								} else if(e.indexOf("code") > -1) {
									if(item[e]) {
										values[`${totalName}[${index}].唯一编码`] = item[e]
									} else {
										delete item[e]
									}
								} else if(item[e] === undefined) {
									delete item[e] // 删除未更改的图片数据
								} else {
									if(valueChangedItemNameList.includes(`${totalName}[${index}].${e}`)){
										values[`${totalName}[${index}].${e}`] = item[e]
									}
								}
							}
						})
						delete values[k] // 删除原始的对象数据
					}else if(values[k]==="removefile"){
						values[k]="";
					}else if(!values[k]){
						delete values[k]
					}else{//不修改的不提交
						if(!valueChangedItemNameList.includes(k)){
							delete values[k]
						}
					}
				}
				console.log(values)
				const formData = new FormData(); 
				formData.append('唯一编码', code?code:"");
				for(let k in values) {
					formData.append(k, values[k]);
				}
				if(actionId){
					formData.append('%actionId%', actionId);
				}
				let url
				if(fieldGroupId){
					url=`api2/entity/${menuId}/detail/rabc/${fieldGroupId}`
				}else{
					url=`api2/entity/${menuId}/detail/normal`
				}
				Super.super({
					url,
					method:'POST',
					data:formData
				},'formdata').then((res)=>{
					this.setState({animating: false,showRabcTempDrawer:false});
					if(res && res.status==="suc"){
						Toast.success("成功！")
						if(menuId!=="user"){
							if(!this.props.match){
								this.props.loadEntites(res.entityCode,fieldGroupId)
							}else{
								this.props.history.push(`/${menuId}`)
							}
						}						
					}else{
						Toast.fail("保存失败!"+res.message)
					}
				})
			}else{
				Toast.fail("必填选项未填！！")
				this.setState({animating: false});
			}
		})
	}
	onRef = (ref) => {
		this.SelectTemplate = ref
	}
	loadTemplate = (entities,addModal) => {
		entities.forEach((item)=>{
			addModal.code=item.唯一编码;
			for(let k in item.byDfieldIds){
				addModal.fields.forEach((it)=>{
					if(k===it.id.toString()){
						it.value=item.byDfieldIds[k]
					}
				})
			}
			this.addList(addModal)
		})	
	}
	deleteList = (code,notShowToast) => {
		let {dtmplGroup} = this.state
		dtmplGroup.forEach((item) => {
			if(item.composite) {
				item.lists = item.lists.filter((it) => it.code.includes(code)===false)
			}
		})
		if(!notShowToast){
			Toast.success("删除成功！")
		}

		this.setState({
			dtmplGroup
		})
	}
	showAlert = (code, e) => {
		e.stopPropagation()
		const alertInstance = alert('删除操作', '确认删除这条记录吗？', [
			{text: '取消'},
			{text: '确认',onPress: () => this.deleteList(code)},
		]);
		setTimeout(() => {
			alertInstance.close();
		}, 10000);
	};
	handlePop = (value) => {
		if(value === "save") {
			this.handleSubmit()
		} else if(value === "nav") {
			this.handleNavAt()
		}else if(typeof value === "object") {
			if(value.type==="action"){
				this.handleSubmit(value.actionId)
			}

		}else{
			this.props.history.push(`/${value}`)
		}
	}
	bodyScroll = (e) => {
		e.preventDefault();
	}
	handleNavAt = () => {
		document.addEventListener('touchmove', this.bodyScroll, {passive: false})
		this.setState({
			visibleNav: true
		})
	}
	scrollToAnchor = (anchorName) => { // 导航
		if(anchorName) {
			let anchorElement = document.getElementById(anchorName);
			if(anchorElement) {
				window.scrollTo(0, anchorElement.offsetTop - 43);
			}
		}
		this.setState({
			visibleNav: false
		})
		document.removeEventListener('touchmove', this.bodyScroll, {passive: false})
	}
	onClose = () => {
		this.setState({
			visibleNav: false
		})
		document.removeEventListener('touchmove', this.bodyScroll, {passive: false})
	}
	seeMore=(record,Num)=>{ // 折叠面板
		const {dtmplGroup}=this.state
		dtmplGroup.forEach((item)=>{
			if(item.id===record.id){
				item.limitLen=Num
			}
		})
		this.setState({
			dtmplGroup
		})
	}	
	editTemplate=(isShowModal,code,groupId)=>{
		this.setState({
			showRabcTempDrawer:isShowModal,
			groupId,
			tempCode:code
		})
	}
	render() { 
		const data = Storage.menuList
		const {getFieldProps} = this.props.form;
		const {dtmplGroup,optionsMap,animating,headerName,menuId,visibleNav,scrollIds,tempCode,premises,
			showRabcTempDrawer,groupId,isDrawer,buttonStatus,actions} = this.state
		if(premises && premises.length>0 && dtmplGroup){
			dtmplGroup.forEach((item)=>{
				if(!item.composite){
					item.fields.forEach((it)=>{
						premises.forEach((i)=>{
							i.type="text"
							i.value=i.fieldValue
							i.name=i.fieldName
							i.title=i.fieldTitle
							i.available=false
							if(it.fieldId===i.fieldId){
								it.available=false
								it.type="text"
								it.value=i.fieldValue
							}
						})
					})
				}
			})
		}
		const detailPop = [
			( <Itempop key="5" value="home" icon={ <span className="iconfont" > &#xe62f; </span>}>首页</Itempop> ),
			( <Itempop key="1" value="user" icon={ <span className="iconfont" > &#xe74c; </span>}>用户</Itempop> ),
			// ( <Itempop key="3" value="save" icon={ <span className="iconfont" > &#xe61a; </span>}>保存</Itempop> ),
			( <Itempop key="4" value="nav" icon={ <span className="iconfont" > &#xe611; </span>}>导航</Itempop> ),
			( <Itempop key="2" value="login" icon={ <span className="iconfont" > &#xe739; </span>}>退出</Itempop> ),
		]

		if(buttonStatus && buttonStatus.saveButton){
			detailPop.push(<Itempop key="3" value="save" icon={ <span className="iconfont" > &#xe61a; </span>}>保存</Itempop> );
		}
		if(actions){
			actions.forEach((action)=>{
				detailPop.push(<Itempop key="3" value={{'type':'action','actionId':action.id}} icon={ <span className="iconfont" > &#xe61a; </span>}>{action.title}</Itempop> )
			})
		}



		const drawerPop=[
			( <Itempop key="3" value="save" icon={ <span className="iconfont" > &#xe61a; </span>}>保存</Itempop> ),
		]
		return( <div className="details" style={menuId==="user"?{paddingTop:0}:null}>
					{menuId==="user"?null:<Nav title = {headerName}
						data = {data}
						handleSelected = {this.handlePop}
						isDrawer={isDrawer}
						shutRabcTem={this.props.match?null:this.props.shutRabcTem}
						pops = {this.props.match?detailPop:drawerPop}/>}
					{premises && premises.length>0?
						<List 
							renderHeader = {() =>"默认字段（不可修改）"}
							id="默认字段（不可修改）">
							<div className = "fixedDiv" > </div>	
							{premises.map((item,index)=>
								<DivFormCard
									formItem = {item}
									getFieldProps = {getFieldProps}
									key={"默认字段（不可修改）"+index}
								/>
							)}
						</List>
					:null}
					<div>

						{
							dtmplGroup && dtmplGroup.map((item, i) => {
							const selectionTemplateId=item.selectionTemplateId
							const dialogSelectType=item.dialogSelectType
							const haveTemplate=dialogSelectType && (selectionTemplateId || item.rabcTemplateGroupId || item.rabcTreeTemplateId)?true:false
							const rabcUncreatable=item.rabcUncreatable
							const rabcUnupdatable=item.rabcUnupdatable
							const rabcTemplateGroupId=item.rabcTemplateGroupId;

							const unallowedCreate=item.unallowedCreate;

							let unmodifiable=false;
							if(unallowedCreate && unallowedCreate==1 ){//临时用新增来控制
								unmodifiable=true;
							}

							const unallowedDelete=item.unallowedDelete
							let rabcTemplatecreatable=false
							let rabcTemplateupdatable=false
							if(rabcTemplateGroupId && rabcUncreatable!=1 ){
								rabcTemplatecreatable=true
							}
							if(rabcTemplateGroupId && rabcUnupdatable!=1){
								rabcTemplateupdatable=true
							}
							const maxDataCount=item.composite?item.composite.maxDataCount?item.composite.maxDataCount:0:0;
							const cardButtonDisabled=item.composite?(item.lists?item.lists.length>=1 && maxDataCount===1?true:false:false):true;
							return <List
										id = {item.title}	
										key = {`${item.id}[${i}]`}
										renderHeader = {() =>
											<div className = "listHeader">
												<span> {item.title}{item.composite && item.lists?`(共${item.lists.length}条)`:null} </span>
												{item.composite ?
													<div className = "detailButtons" >
														{unallowedCreate || cardButtonDisabled ?null:
														<span className = "iconfont"
															onClick = {() => this.addList(item)} > &#xe63d;
														</span>}
														{haveTemplate && !isDrawer && !cardButtonDisabled ?
															<span className="iconfont"
																  onClick={() => this.SelectTemplate.onOpenChange(item)}>
															&#xe6f4; 
														</span>:null
														}
														{rabcTemplatecreatable && !cardButtonDisabled && !isDrawer ? // 判断是否是弹出的抽屉
														<span className = "iconfont"
															onClick = {() =>this.editTemplate(true,null,item.id)} >
															&#xe61b;
														</span>	:null}
													</div>:null
												} 
											</div>}
									> 
									{ /* 为了弥补fixed之后的空白区域 */ }
									<div className = "fixedDiv" > </div>	
									{item.composite && item.lists?
										item.lists.map((it,index)=>{
											if(index<=item.limitLen){
												return <div key={it.id+index}>
															<EditList
																rabcUnupdatable={!rabcTemplateupdatable}
																unallowedDelete={unallowedDelete}
																unmodifiable={unmodifiable}
																formItemValueOnChange={this.formItemValueOnChange}
																formList = {it}
																getFieldProps = {getFieldProps}
																optionsMap = {optionsMap}
																isDrawer={isDrawer}
																rabcTemplateupdatable={rabcTemplateupdatable}
																deleteList = {(e) => this.showAlert(it.code, e)}
																editTemplate={rabcUnupdatable?null:()=>this.editTemplate(true,it.code,item.id)}
															/>
															{index===item.limitLen && item.lists.length>item.limitLen+1?
															<span 
																className="more iconfont" 
																onClick={()=>this.seeMore(item,100)}>
																	&#xe624;
															</span>
															:null}
															{item.limitLen===100 && index===item.lists.length-1?
															<span 
																className="more iconfont trans" 
																onClick={()=>this.seeMore(item,1)}>
																	&#xe624;
															</span>
															:null}
														</div>
											}else{
												return 	<div key={it.id+index} style={{display:"none"}}>
															<EditList
																rabcUnupdatable={rabcUnupdatable}
																unallowedDelete={unallowedDelete}
																formItemValueOnChange={this.formItemValueOnChange}
																formList = {it}
																getFieldProps = {getFieldProps}
																optionsMap = {optionsMap}
																isDrawer={isDrawer}
																rabcTemplateupdatable={rabcTemplateupdatable}
																deleteList = {(e) => this.showAlert(it.code, e)}
																editTemplate={rabcUnupdatable?null:()=>this.editTemplate(true,it.code,item.id)}
															/>
														</div>
												}																					
										}):
										item.fields.map((it, index) => {
											if(index<=item.limitLen){
												return <div key = {it.id+index}>
															<DivFormCard
																formItemValueOnChange={this.formItemValueOnChange}
																formItem = {it}
																getFieldProps = {getFieldProps}
																optionsMap = {optionsMap}
															/>
															{index===item.limitLen && item.fields.length>item.limitLen+1?
															<span 
																className="more iconfont" 
																onClick={()=>this.seeMore(item,100)}>
																	&#xe624;
															</span>
															:null}
															{item.limitLen===100 && index===item.fields.length-1?
															<span 
																className="more iconfont trans" 
																onClick={()=>this.seeMore(item,4)}>
																	&#xe624;
															</span>
															:null}
														</div>
											}else{
												return 	<div key = {Units.RndNum(9)} style={{display:"none"}}>
															<DivFormCard
																formItemValueOnChange={this.formItemValueOnChange}
																formItem = {it}
																getFieldProps = {getFieldProps}
																optionsMap = {optionsMap}
															/>
														</div>
												}
											})											
											
										} 
									</List>
						})} 
					</div> 
				<TemplateDrawer  // 选择实体模板
					onRef = {this.onRef}
					menuId = {menuId}
					loadTemplate = {this.loadTemplate}
				/>
				<RabcTemplateDrawer 
					showRabcTempDrawer={showRabcTempDrawer}
					menuId = {menuId}
					groupId={groupId}
					dtmplGroup={dtmplGroup}
					loadTemplate={this.loadTemplate}
					tempCode={tempCode}
					shutRabcTem={()=>this.editTemplate(false,null,null)}
				/>
				<ActivityIndicator
					toast
					text = "加载中..."
					animating = {animating}
				/>
				<Modal
					popup
					visible = {visibleNav}
					onClose = {this.onClose}
					animationType = "slide-up" >
					<List renderHeader = {() => <div > 请选择 </div>} className="popup-list"> 
						<div className = "navbox" > 
							{scrollIds.map((i, index) => 
								<List.Item key = {index} onClick = {() => this.scrollToAnchor(i)} > {i} </List.Item>)
							} 
						</div> 
						<List.Item >
							<Button onClick = {this.onClose}>取消</Button> 
						</List.Item> 
					</List> 
				</Modal> 
			</div>
		)
	}
}
export default createForm()(Details);