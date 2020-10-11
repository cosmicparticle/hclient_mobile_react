import React, {Component} from 'react'
import { ImagePicker } from 'antd-mobile';
import RcViewer from '@hanyk/rc-viewer'

export default class ImgBox extends Component {

	state = {
		receivedFilesProps: false,
	}

	componentWillMount(){
		let files=this.props.files;
			this.setState({
				files,
				imgUrl:files?files[0]?files[0].url:"":"",
			});
	}
	componentWillReceiveProps(nextProps) {
 		let {receivedFilesProps}=this.state;
// 		if(isRemove){
// 			this.setState({
// 				isRemove:false,
// 			});
// }else{
		//只接收一次
		if(!receivedFilesProps){
			let files=nextProps.files;
			this.setState({
				files,
				imgUrl:files?files[0]?files[0].url:"":"",
				receivedFilesProps:true,
			});
		}

		// }
		console.log(nextProps);
	}
	onChange = (files, type) => {
		console.log(files, type);
		// let isRemove=type==="remove"?true:false;
		this.setState({
			files,
		});
		if(type==="remove"){
			this.triggerChange( "removefile");
		}else{
			this.triggerChange(files.length > 0 ? files[0].file : "");
		}
	}
	triggerChange = (changedValue) => {
		const onChange = this.props.onChange;
		if(onChange) {
			onChange(changedValue);
		}
	}



	onImageClick=(index,files)=>{
		const { viewer } = this.refs.viewer;
		let imgUrl=files[index].url;
		this.setState({
			imgUrl,
		});
		// "<img src='http://121.196.184.205:96/hydrocarbon/download-files/934ad7ce5c53631ed716e84f69949631/Capture001.png' />"

		viewer.show()
	}
	render() {
		//let files=this.state.files&&this.state.files.length>0?this.state.files:this.props.files;
		let {files,imgUrl}=this.state;
		return(
			<div>
                <ImagePicker
                    files={files}
                    onChange={this.onChange}
                    onImageClick={this.onImageClick}
                    selectable={files.length < 1}
                    multiple={false}
                />
				<RcViewer options={{}} ref='viewer'  >
					<img style={{display:'none'}} src={imgUrl} alt=""/>
				</RcViewer>
            </div>
		)
	}
}