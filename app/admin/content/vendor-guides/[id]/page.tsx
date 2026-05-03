import { CmsEditView } from '../../_shared/CmsCrud'
export default function Page({ params }: { params: { id: string } }) {
  return <CmsEditView kind="vendor-guides" id={params.id} />
}
