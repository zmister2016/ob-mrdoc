import axios from 'axios';
import { AxiosRequestConfig } from 'axios'; 
import { MrdocPluginSettings } from "./setting";
import MrdocPlugin from "./main";

export class MrdocApiReq{
    settings: MrdocPluginSettings;
    plugin: MrdocPlugin;
    private mrdocUrl: string;
    private mrdocToken: string;

    constructor(settings: MrdocPluginSettings, plugin: MrdocPlugin) {
        this.settings = settings;
        this.plugin = plugin;
        this.mrdocUrl = settings.mrdocUrl;
        this.mrdocToken = settings.mrdocToken;
      }

    // 定义一个公共的 Axios 请求类
    private async sendRequest(apiPath: string, doc: any, method: string = 'post'): Promise<any> {
      const apiUrl = `${this.mrdocUrl}/api/${apiPath}/`;
      const queryString = `token=${this.mrdocToken}`;
      
      let config: AxiosRequestConfig = {
          url: `${apiUrl}?${queryString}`,
          method: method,
      };
  
      // 根据请求方法设置参数
      if (method.toLowerCase() === 'get') {
          config.params = doc;
      } else {
          const docData = new FormData();
          for (const key in doc) {
              if (Object.prototype.hasOwnProperty.call(doc, key)) {
                  docData.append(key, doc[key]);
              }
          }
          config.data = docData;
      }
  
      try {
          const resp = await axios.request(config);
          return resp.data;
      } catch (error) {
          console.log(`${apiPath}请求出错：`, error);
          return { status: false };
      }
  }
  

    // 获取文集的层级文档列表
    async getProjectDocs(doc:any){
      return this.sendRequest('get_level_docs',doc,'get')
    } 

    // 获取指定文档
    async getDoc(doc:any){
      return this.sendRequest('get_doc',doc,'get')
    }

    // 创建文集
    async createProject(doc: any): Promise<any> {
      return this.sendRequest('create_project',doc)
    }

    // 创建文档
    async createDoc(doc: any): Promise<any> {
        return this.sendRequest('create_doc', doc);
    }

    // 修改文档
    async modifyDoc(doc:any): Promise<any> {
        return this.sendRequest('modify_doc', doc);
    }

    // 删除文档
    async delDoc(doc:any): Promise<any> {
        return this.sendRequest('delete_doc', doc);
    }

    // 上传图片
    async uploadImage(doc:any): Promise<any> {
        return this.sendRequest('upload_img', doc);
    }

    // 上传URL图片
    async uploadUrlImage(doc:any): Promise<any> {
        return this.sendRequest('upload_img_url', doc);
    }

    // 批量上传URL图片
    async uploadUrlImageBatch(files:any): Promise<any> {
        const result = [];
        for (const file of files) {
            let path = file.path
            let doc = {
                url:path
            }
            const resp = await this.sendRequest('upload_img_url', doc);
            console.log(resp)
            if(resp.code == 0){
                resp.data['originalFile'] = file;
                resp.data['success'] = true;
                result.push(resp.data)
            }else{
                console.log("图片转存失败：",path)
                result.push({originalURL:path,url:path,originalFile:file,success:false})
            }
        }
        return result
    }
}

