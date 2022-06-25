/*
 * @Descripttion: 表情包详情页
 * @Author: EdisonGu
 * @Date: 2022-04-28 22:55:05
 * @LastEditors: EdisonGu
 * @LastEditTime: 2022-06-23 21:11:45
 */
import React, { Component } from 'react'
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import Styles from './index.module.scss'
import { fetchEmoticonDetail } from '@/api'
import { DEFAULT_IMG } from '@/constants'
import { getPageUrl } from '@/utils/jumpLink'
import { Card, Row, Col, Image } from 'antd'
import MainContainer from '@/components/common/MainContainer'
import EmojiCard from '@/components/common/EmojiCard'
import EmojiFooter from '@/components/common/EmojiFooter'
import ImgWaterfall from '@/components/common/ImgWaterfall'
interface Props {
  emoticonInfo: any,
  nextInfo: any,
  preInfo: any,
  htmlTitle: string
}

interface State {
  // isClient: boolean
}

class Emoticon extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
  }
  render() {
    const { emoticonInfo: { title, imgList = [], id }, nextInfo, preInfo } = this.props
    return (
      <div className={Styles['emoticon-container']}>
        <MainContainer>
          <div className="left-content">
            <Card className="card-container" title={title}>
              <div className={Styles['waterfall-container']}>
                <ImgWaterfall imgList={imgList} id={id} />
              </div>
              <EmojiFooter nextInfo={nextInfo} preInfo={preInfo} type="emoticon" />
            </Card>
          </div>
          <div className="right-content">右边内容</div>
        </MainContainer>
      </div>
    )
  }
}

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  const id = context.params._id.replace('.html','')
  let emoticonInfo = {
    title: ''
  }
  let nextInfo = {}
  let preInfo ={}
  const { code, data } = await fetchEmoticonDetail({id})
  if (code === 1) {
    const { selfNode, nextNode, preNode } = data
    emoticonInfo = selfNode
    nextInfo = nextNode
    preInfo = preNode
  }
  return { props: { emoticonInfo, nextInfo, preInfo, htmlTitle: emoticonInfo.title } }
}

export default Emoticon