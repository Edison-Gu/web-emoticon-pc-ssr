import React, { Component } from 'react'
import Styles from './Search.module.scss'
import { PAGE_KEY } from '@/constants'
import { Input, Empty, Button } from 'antd'
import { getLocalItem, setLocalItem } from '@/utils/storage'
import { fetchSearchKeyword } from '@/api'
import { getPageUrl } from '@/utils/jumpLink'
import { SearchOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'

interface Props {
  router?: any
}
interface State {
  keyword: string,
  showSearch: boolean,
  isSearch: boolean, // 是否点击搜索按钮
  searchHistory: Array<string>,
  emojiList: Array<any>,
  emoticonList: Array<any>,
  tabList: Array<any>,
  tabType: string,
}

let timer:any = null
export default class PageHead extends Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = {
      keyword: '',
      showSearch: false,
      isSearch: false,
      searchHistory: [],
      emojiList: [],
      emoticonList: [],
      tabList: [
        {
          tab: '表情',
          key: PAGE_KEY.EMOJI_DETAIL
        },
        {
          tab: '表情包',
          key: PAGE_KEY.EMOTICON_DETAIL
        },
        {
          tab: 'DIY表情',
          key: 'diy'
        },
      ],
      tabType: PAGE_KEY.EMOJI_DETAIL
    }
    // this.inputFlag = 0
  }
  componentDidMount() {
    document.addEventListener('keydown', e => {
      const { showSearch, keyword } = this.state
      if (e.keyCode == 13 && showSearch && keyword) {
        this.handleSearch()
      }
    })
  }

  async searchApi() {
    const { keyword } = this.state
    try {
      const { code, data } = await fetchSearchKeyword({
        keyword,
        type: 'all',
        pageSize: 10
      })
      if (code === 1 && data) {
        const { emoji = [], emoticon = [] } = data
        this.setState({
          emojiList: emoji,
          emoticonList: emoticon
        })
      }
    } catch (error) {
      console.log('----searchApi', error)
    }
  }

  setShowModel(showSearch: boolean) {
    const { keyword, emojiList } = this.state
    this.setState({
      keyword: showSearch ? keyword : '',
      emojiList: showSearch ? emojiList : [],
      isSearch: false,
      showSearch,
      searchHistory: typeof getLocalItem({ key: 'pc_ssr_nav_history' }) === 'object' ? getLocalItem({ key: 'pc_ssr_nav_history' }) : []
    })
  }

  /**
   * 处理搜索
   */
  handleSearch() {
    const { keyword, searchHistory = [] } = this.state
    if (!keyword) return
    const index = searchHistory.findIndex(item => item === keyword)
    const list = index > -1 ? searchHistory : [keyword, ...searchHistory].slice(0, 10)
    setLocalItem({ key: 'pc_ssr_nav_history', value: JSON.stringify(list) })
    this.searchApi()
    this.setState({ searchHistory: list, isSearch: true })
  }
  /**
   * 处理点击搜索历史item
   */
  async handleHistoryClick(item:string) {
    await this.setState({ keyword: item })
    this.handleSearch()
  }
  /**
   * 搜索框输入事件
   */
  handleInputChange(e: any) {
    const keyword = e.target.value
    this.setState({ 
      keyword,
      isSearch: keyword.length !== 0
    })
    clearTimeout(timer)
    timer = setTimeout(() => {
      this.handleSearch()
    }, 500)
  }
  /**
   * 获取当前搜索展示tabData
   */
  handleTabeData() {
    let list = []
    const { tabType, emojiList, emoticonList } = this.state
    switch (tabType) {
      case PAGE_KEY.EMOJI_DETAIL:
        list = emojiList
        break;
      case PAGE_KEY.EMOTICON_DETAIL:
        list = emoticonList
        break;
      default:
        break;
    }
    return list
  }
  /**
   * 匹配到搜索后的字段
   */
  matchText(item: any) {
    const { keyword, tabType } = this.state
    const { imgDes = '', title = '', count = 0 } = item
    const regExp = new RegExp(keyword, 'g')
    const str = tabType === PAGE_KEY.EMOTICON_DETAIL ? `${title} - ${count}张` : imgDes
    const html = str.replace(regExp, `<span>${keyword}</span>`)
    return html
  }
  /**
   * 删除对应下标的搜索历史记录
   */
  deleteHistory(index: number) {
    const { searchHistory = [] } = this.state
    const list = searchHistory.slice(index + 1)
    this.setState({ searchHistory: list })
  }

  render() {
    const { searchHistory, emojiList, tabList, showSearch, keyword, tabType, isSearch } = this.state
    const tabData = this.handleTabeData()
    return (
      <div className={Styles['search-container']}>
        <div className={Styles['nav-search']}>
          <div className={Styles['nav-input']} onClick={() => this.setShowModel(true)}>
            请输入你想搜索的表情~
          </div>
          <SearchOutlined className={Styles['search-icon']} />
          <div className={ showSearch ? Styles['search-model'] : `${Styles['search-model']} ${Styles['no-show']}`}>
            <div className={Styles['model-input']}>
              <Input
                className={Styles['search-input']}
                placeholder='请输入你想搜索的表情~'
                style={{ left: showSearch ? '0' : '50px' }}
                value={keyword}
                onChange={e => this.handleInputChange(e)} />
              <div>
                <SearchOutlined className={`${Styles.icon} icon-search`} onClick={() => this.handleSearch()} />
                <CloseOutlined className={Styles.icon} onClick={() => this.setShowModel(false)} />
              </div>
            </div>
            <div style={{display: showSearch ? 'block' : 'none'}}>
              <div className={Styles.line}></div>
              <div className={Styles['model-content']}>
                {
                  isSearch
                    ? <div className={Styles['content-wrap']}>
                        <div className={Styles['title']}>
                          {
                            tabList.map((item, index) => (
                              <div
                                className={item.key === tabType ? Styles.active : ''}
                                key={index}
                                onClick={() => this.setState({ tabType: item.key }) }>{item.tab}</div>
                            ))
                          }
                        </div>
                        <div className={Styles['content']}>
                          {
                            tabData.length
                              ? <>
                                  <div className={Styles['content-search']}>
                                    {
                                      tabData.map((item, index) => (
                                        <div className={Styles['content-item']} key={index}>
                                          <a href={getPageUrl({id: item.id, key: tabType})}>
                                            <p dangerouslySetInnerHTML={{
                                              __html: this.matchText(item)
                                            }}></p>
                                          </a>
                                        </div>
                                      ))
                                    }
                                  </div>
                                  <div className={Styles['more-wrap']}>
                                    <div className={Styles.line}></div>
                                    <a className={Styles['more-btn']} href={getPageUrl({ key: PAGE_KEY.SEARCH_KEYWORD, query: { keyword, tabType } })}>查看更多</a>
                                  </div>
                                </>
                              : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          }
                        </div>
                      </div>
                    : <div className={Styles['history-wrap']}>
                        <div className={Styles['history-title']}>
                          搜索历史
                          <DeleteOutlined className={Styles.icon} onClick={() => { this.setState({ searchHistory: [] }) }} />
                        </div>
                        <div className={Styles['history-content']}>
                          {
                            searchHistory.length
                              ? <>
                                {
                                  searchHistory.map((item, index) => (
                                    <div key={index} className={Styles['history-item']}>
                                      <p onClick={() => this.handleHistoryClick(item)}>{item}</p>
                                      <CloseOutlined className={Styles.icon} onClick={() => this.deleteHistory(index)} />
                                    </div>
                                  ))
                                }
                              </>
                              : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          }
                        </div>
                      </div>
                }
              </div>
            </div>
          </div>
          <div
            className={Styles.mask}
            style={{display: showSearch ? 'block' : 'none'}}
            onClick={() => this.setShowModel(false)}></div>
        </div>
      </div>
    )
  }
}